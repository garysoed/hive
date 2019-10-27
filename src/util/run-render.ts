import * as path from 'path';

import { combineLatest, from as observableFrom, Observable, of as observableOf } from '@rxjs';
import { map, mapTo, switchMap } from '@rxjs/operators';

import { RenderRule } from '../core/render-rule';
import { RuleType } from '../core/rule-type';

import { generateRunSpecs } from './generate-run-specs';
import { readFile } from './read-file';
import { readRule } from './read-rule';
import { resolveFileRef } from './resolve-file-ref';
import { resolveInputs } from './resolve-inputs';
import { resolveRoot } from './resolve-root';
import { runProcessor } from './run-processor';
import { RunRuleFn } from './run-rule-fn';
import { validateInputs } from './validate-inputs';
import { writeFile } from './write-file';


export function runRender(
    rule: RenderRule,
    runRuleFn: RunRuleFn,
): Observable<ReadonlyMap<string, unknown>> {
  const outputPattern$ = resolveRoot(rule.output.rootType)
      .pipe(map(root => path.join(root, rule.output.pattern)));

  return combineLatest([
    readRule(rule.processor),
    outputPattern$,
  ]).pipe(
      switchMap(([processor, outputPattern]) => {
        if (processor.type !== RuleType.DECLARE) {
          throw new Error(`Rule ${rule.processor} should be a declare rule, but not`);
        }

        const processorContent$ = resolveFileRef(processor.processor)
            .pipe(switchMap(path => readFile(path)));

        return combineLatest([
          validateInputs(rule.inputs, processor.inputs),
          resolveInputs(rule.inputs, runRuleFn),
          processorContent$,
        ])
        .pipe(
            switchMap(([repeatedKeys, validatedInputs, processorContent]) => {
              const results: Array<Observable<[string, unknown]>> = generateRunSpecs(
                  validatedInputs,
                  repeatedKeys,
                  outputPattern,
              )
              .map(runSpec => {
                const resultRaw = runProcessor(processorContent, runSpec.inputs);
                const result$ = resultRaw instanceof Promise ?
                    observableFrom(resultRaw) : observableOf(resultRaw);
                return result$.pipe(
                    switchMap(result => {
                      return writeFile(runSpec.outputPath, `${result}`).pipe(
                          mapTo([runSpec.outputPath, result] as [string, unknown]),
                      );
                    }),
                );
              });

              if (results.length === 0) {
                return observableOf(new Map());
              }

              return combineLatest(results).pipe(map(results => new Map<string, unknown>(results)));
            }),
        );
      }),
  );
}

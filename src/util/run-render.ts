import * as path from 'path';

import { combineLatest, Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

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


export function runRender(
    rule: RenderRule,
    runRuleFn: RunRuleFn,
): Observable<ReadonlyMap<string, string>> {
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
            map(([repeatedKeys, validatedInputs, processorContent]) => {
              const results: Array<[string, string]> = generateRunSpecs(
                  validatedInputs,
                  repeatedKeys,
                  outputPattern,
              )
              .map(runSpec => {
                return [
                  runSpec.outputPath,
                  runProcessor(processorContent, runSpec.inputs),
                ];
              });

              return new Map(results);
            }),
        );
      }),
  );
}

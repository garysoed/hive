import * as path from 'path';

import { combineLatest, from as observableFrom, Observable, of as observableOf, throwError } from '@rxjs';
import { map, mapTo, switchMap, tap } from '@rxjs/operators';
import { Logger } from '@santa';

import { Processor } from '../core/processor';
import { RenderInput } from '../core/render-input';
import { RenderRule } from '../core/render-rule';
import { RuleRef } from '../core/rule-ref';
import { RuleType } from '../core/rule-type';
import { BUILT_IN_PROCESSOR_MAP, BUILT_IN_PROCESSOR_TYPE, BuiltInProcessorId } from '../processor/built-in-processor-id';
import { loadProjectConfig } from '../project/load-project-config';

import { generateRunSpecs } from './generate-run-specs';
import { readRule } from './read-rule';
import { resolveInputs } from './resolve-inputs';
import { resolveRoot } from './resolve-root';
import { RunRuleFn } from './run-rule-fn';
import { validateInputs } from './validate-inputs';
import { writeFile } from './write-file';


const LOGGER = new Logger('@hive/util/run-render');

export function runRender(
    rule: RenderRule,
    runRuleFn: RunRuleFn,
): Observable<ReadonlyMap<string, unknown>> {
  const outputPattern$ = resolveRoot(rule.output.rootType)
      .pipe(map(root => path.join(root, rule.output.pattern)));

  return combineLatest([
    getProcessor(rule.processor, runRuleFn),
    outputPattern$,
    loadProjectConfig(),
  ]).pipe(
      switchMap(([declaration, outputPattern, projectConfig]) => {
        const allInputs = new Map<string, RenderInput>([
          ...projectConfig.globals,
          ...rule.inputs,
        ]);

        return resolveInputs(allInputs, runRuleFn).pipe(
          switchMap(resolvedInputs => {
            LOGGER.progress(`Running: ${rule.name}`);
            const repeatedKeys = validateInputs(resolvedInputs, declaration.inputs);
            const runSpecs = generateRunSpecs(
                resolvedInputs,
                repeatedKeys,
                outputPattern,
            );
            const results: Array<Observable<[string, unknown]>> = runSpecs
                .map(runSpec => {
                  const resultRaw = declaration.fn(runSpec.inputs);
                  const result$ = resultRaw instanceof Promise ?
                      observableFrom(resultRaw) : observableOf(resultRaw);
                  return result$.pipe(
                      switchMap(result => {
                        return writeFile(runSpec.outputPath, declaration.output.write(result)).pipe(
                            tap(() => LOGGER.success(`Updated: ${runSpec.outputPath}`)),
                            mapTo([runSpec.outputPath, result] as [string, unknown]),
                        );
                      }),
                  );
                });

            if (results.length === 0) {
              LOGGER.warning(`No results found for ${rule.name}`);
              return observableOf(new Map());
            }

            return combineLatest(results).pipe(
              map(results => new Map<string, unknown>(results)),
            );
          }),
        );
      }),
  );
}

function getProcessor(
    processorSpec: RuleRef|BuiltInProcessorId,
    runRuleFn: RunRuleFn,
): Observable<Processor> {
  if (!BUILT_IN_PROCESSOR_TYPE.check(processorSpec)) {
    return readRule(processorSpec).pipe(
        switchMap(processor => {
          if (processor.type !== RuleType.DECLARE) {
            throw new Error(`Rule ${processorSpec} should be a declare rule, but not`);
          }

          return runRuleFn(processor);
        }),
    );
  }

  const builtInProcessor = BUILT_IN_PROCESSOR_MAP.get(processorSpec);
  if (!builtInProcessor) {
    return throwError(new Error(`Invalid built in processor: ${processorSpec}`));
  }

  return observableOf(builtInProcessor);
}

import * as path from 'path';

import {Vine} from 'grapevine';
import {combineLatest, from, NEVER, Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {Logger} from 'santa';

import {Processor} from '../core/processor';
import {RenderInput} from '../core/render-input';
import {RenderRule} from '../core/render-rule';
import {RuleRef} from '../core/rule-ref';
import {RuleType} from '../core/rule-type';
import {BUILT_IN_PROCESSOR_MAP, BUILT_IN_PROCESSOR_TYPE, BuiltInProcessorId} from '../processor/built-in-processor-id';
import {loadProjectConfig} from '../project/load-project-config';

import {generateRunSpecs} from './generate-run-specs';
import {readRule} from './read-rule';
import {resolveInputs} from './resolve-inputs';
import {resolveRoot} from './resolve-root';
import {RunRuleFn} from './run-rule-fn';
import {validateInputs} from './validate-inputs';
import {writeFile} from './write-file';


const LOGGER = new Logger('@hive/util/run-render');

export function runRender(
    vine: Vine,
    rule: RenderRule,
    runRuleFn: RunRuleFn,
    cwd: string,
): Observable<ReadonlyMap<string, unknown>> {
  const outputPattern$ = resolveRoot(vine, rule.output.rootType, cwd)
      .pipe(map(root => path.join(root, rule.output.pattern)));

  return combineLatest([
    getProcessor(vine, rule.processor, runRuleFn, cwd),
    outputPattern$,
    loadProjectConfig(vine),
  ]).pipe(
      switchMap(([declaration, outputPattern, projectConfig]) => {
        const allInputs = new Map<string, RenderInput>([
          ...projectConfig.globals,
          ...rule.inputs,
        ]);

        return resolveInputs(vine, allInputs, runRuleFn, cwd).pipe(
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
                    const resultRaw = declaration.fn(vine, runSpec.inputs);
                    const result$ = resultRaw instanceof Promise
                      ? from(resultRaw) : of(resultRaw);
                    return result$.pipe(
                        switchMap(result => {
                          return writeFile(
                              vine,
                              runSpec.outputPath,
                              declaration.output.write(result),
                          )
                              .pipe(
                                  tap(() => LOGGER.success(`Updated: ${runSpec.outputPath}`)),
                                  map(() => [runSpec.outputPath, result] as [string, unknown]),
                              );
                        }),
                    );
                  });

              if (results.length === 0) {
                LOGGER.warning(`No results found for ${rule.name}`);
                return of(new Map());
              }

              return combineLatest(results).pipe(
                  map(results => new Map<string, unknown>(results)),
              );
            }),
            catchError(e => {
              LOGGER.error(e);
              return NEVER;
            }),
        );
      }),
  );
}

function getProcessor(
    vine: Vine,
    processorSpec: RuleRef|BuiltInProcessorId,
    runRuleFn: RunRuleFn,
    cwd: string,
): Observable<Processor> {
  if (!BUILT_IN_PROCESSOR_TYPE.check(processorSpec)) {
    return readRule(vine, processorSpec, cwd).pipe(
        switchMap(({rule: processor, path}) => {
          if (processor.type !== RuleType.DECLARE) {
            throw new Error(`Rule ${processorSpec} should be a declare rule, but not`);
          }

          return runRuleFn(vine, processor, path);
        }),
    );
  }

  const builtInProcessor = BUILT_IN_PROCESSOR_MAP.get(processorSpec);
  if (!builtInProcessor) {
    return throwError(() => new Error(`Invalid built in processor: ${processorSpec}`));
  }

  return of(builtInProcessor);
}

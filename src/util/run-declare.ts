import {Vine} from 'grapevine';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {DeclareRule} from '../core/declare-rule';
import {OutputFn} from '../core/output-fn';
import {Processor} from '../core/processor';

import {readFile} from './read-file';
import {resolveFileRef} from './resolve-file-ref';


export function runDeclare(vine: Vine, rule: DeclareRule, cwd: string): Observable<Processor> {
  const sortedInputArgs = [...rule.inputs.keys()].sort();
  return resolveFileRef(vine, rule.processor, cwd).pipe(
      switchMap(filePath => {
        return readFile(vine, filePath).pipe(
            map(fileContent => {
              return (...args: unknown[]) => {
                let returnValue: unknown;
                const returnFn: OutputFn = value => {
                  returnValue = value;
                };
                Function(...sortedInputArgs, 'output', fileContent)(...args, returnFn);

                return returnValue;
              };
            }),
        );
      }),
      map(processorFn => {
        const fn = (vine: Vine, inputs: ReadonlyMap<string, unknown>): unknown => {
          const inputsValues = sortedInputArgs.map(key => inputs.get(key));
          return processorFn(...inputsValues);
        };

        return {
          inputs: rule.inputs,
          output: rule.output,
          fn,
        };
      }),
  );
}

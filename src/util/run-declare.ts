import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { DeclareRule } from '../core/declare-rule';
import { OutputFn } from '../core/output-fn';
import { Processor } from '../core/processor';

import { readFile } from './read-file';
import { resolveFileRef } from './resolve-file-ref';


export function runDeclare(rule: DeclareRule): Observable<Processor> {
  const sortedInputArgs = [...rule.inputs.keys()].sort();
  return resolveFileRef(rule.processor).pipe(
      switchMap(filePath => {
        return readFile(filePath).pipe(
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
        const fn = (inputs: ReadonlyMap<string, unknown>) => {
          const inputsValues = sortedInputArgs.map(key => inputs.get(key));
          return processorFn(...inputsValues);
        };

        return {
          inputs: rule.inputs,
          fn,
        };
      }),
  );
}

import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { DeclareFn } from '../core/declare-fn';
import { DeclareRule } from '../core/declare-rule';

import { readFile } from './read-file';
import { resolveFileRef } from './resolve-file-ref';


export function runDeclare(rule: DeclareRule): Observable<DeclareFn> {
  const sortedInputArgs = [...rule.inputs.keys()].sort();
  return resolveFileRef(rule.processor).pipe(
      switchMap(filePath => {
        return readFile(filePath).pipe(
            map(fileContent => {
              return Function(...sortedInputArgs, fileContent);
            }),
        );
      }),
      map(processorFn => {
        return (inputs: ReadonlyMap<string, unknown>) => {
          const inputsValues = sortedInputArgs.map(key => inputs.get(key));
          return processorFn(...inputsValues);
        };
      }),
  );
}

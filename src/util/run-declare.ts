import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { DeclareRule } from '../core/declare-rule';

import { readFile } from './read-file';
import { resolveFileRef } from './resolve-file-ref';
import { runProcessor } from './run-processor';


export type DeclareFn = (inputs: ReadonlyMap<string, unknown>) => unknown;

export function runDeclare(rule: DeclareRule): Observable<DeclareFn> {
  return resolveFileRef(rule.processor).pipe(
      switchMap(filePath => readFile(filePath)),
      map(fileContent => {
        return (inputs: unknown) => {
          if (!(inputs instanceof Map)) {
            throw new Error('Inputs to processor should be a map');
          }
          return runProcessor(fileContent, inputs);
        };
      }),
  );
}

import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { switchMap } from '@rxjs/operators';

import { isFileRef } from '../core/file-ref';
import { LoadRule } from '../core/load-rule';

import { globWrapper } from './glob-wrapper';
import { readFile } from './read-file';
import { resolveFileRef } from './resolve-file-ref';
import { resolveRoot } from './resolve-root';


export function runLoad(rule: LoadRule): Observable<string|string[]> {
  debugger;
  if (isFileRef(rule.srcs)) {
    return resolveFileRef(rule.srcs).pipe(
        switchMap(path => readFile(path)),
    );
  }

  const globRef = rule.srcs;
  return resolveRoot(globRef.rootType).pipe(
      switchMap(root => globWrapper.glob(globRef.globPattern, {cwd: root})),
      switchMap((paths: string[]) => {
        if (paths.length <= 0) {
          return observableOf<string[]>([]);
        }

        const content$List = paths.map(path => readFile(path));
        return combineLatest(content$List);
      }),
  );
}

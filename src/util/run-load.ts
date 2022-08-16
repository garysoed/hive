import {Vine} from 'grapevine';
import {$asArray, $flat} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {isFileRef} from '../core/file-ref';
import {LoadRule} from '../core/load-rule';

import {globWrapper} from './glob-wrapper';
import {readFile} from './read-file';
import {resolveFileRef} from './resolve-file-ref';
import {resolveRoot} from './resolve-root';


export function runLoad(vine: Vine, rule: LoadRule, cwd: string): Observable<readonly string[]> {
  const src$Array: Array<Observable<string[]>> = [];
  for (const src of rule.srcs) {
    if (isFileRef(src)) {
      src$Array.push(
          resolveFileRef(vine, src, cwd).pipe(
              switchMap(path => readFile(vine, path)),
              map(content => [content]),
          ),
      );
      continue;
    }

    src$Array.push(
        resolveRoot(vine, src.rootType, cwd).pipe(
            switchMap(root => globWrapper.glob(src.globPattern, {cwd: root})),
            switchMap((paths: string[]) => {
              if (paths.length <= 0) {
                return observableOf<string[]>([]);
              }

              const content$List = paths.map(path => readFile(vine, path));
              return combineLatest(content$List);
            }),
        ),
    );
  }

  return combineLatest(src$Array).pipe(
      map(contents => $pipe(contents, $flat(), $asArray())),
  );
}

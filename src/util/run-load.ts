import {Vine} from 'grapevine';
import {$asArray, $flat} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';


import {isFileRef} from '../core/file-ref';
import {LoadRule} from '../core/load-rule';
import {$glob} from '../external/glob';

import {readFile} from './read-file';
import {resolveFileRef} from './resolve-file-ref';
import {resolveRoot} from './resolve-root';


export function runLoad(vine: Vine, rule: LoadRule, cwd: string): Observable<readonly string[]> {
  const glob = $glob.get(vine);
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
            switchMap(root => new Observable<readonly string[]>(subscriber => {
              const handler = glob(src.globPattern, {cwd: root}, (err, matches) => {
                if (err) {
                  subscriber.error(err);
                } else {
                  subscriber.next(matches);
                }
              });

              return {
                unsubscribe(): void {
                  handler.abort();
                },
              };
            })),
            switchMap(paths => {
              if (paths.length <= 0) {
                return of([]);
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

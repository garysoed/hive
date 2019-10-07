import * as path from 'path';

import { assertNonNull } from '@gs-tools/rxjs';
import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { findRoot } from '../project/find-root';
import { loadProjectConfig } from '../project/load-project-config';
import { readFile } from '../util/read-file';


export class FileRef {
  readonly content$: Observable<string> = createContent(this.path);

  constructor(private readonly path: string) { }
}

function createContent(path: string): Observable<string> {
  try {
    const uri = new URL(path);

    switch (uri.protocol) {
      case 'out:':
        return loadContent(
            loadProjectConfig().pipe(map(config => config.outdir)),
            uri.pathname,
        );
      default:
        // Treat it as a path.
        return loadContent(findRoot().pipe(assertNonNull()), path);
    }
  } catch (e) {
    // Treat it as a path.
    return loadContent(findRoot().pipe(assertNonNull()), path);
  }
}

/**
 * @param root$ Emits the absolute path to the root.
 * @param path The path relative to the root
 */
function loadContent(root$: Observable<string>, filepath: string): Observable<string> {
  return root$.pipe(
      map(root => path.join(root, filepath)),
      switchMap(absolutePath => readFile(absolutePath)),
  );
}

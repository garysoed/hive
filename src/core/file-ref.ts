import * as nodePath from 'path';

import { Observable, of as observableOf } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

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
            loadProjectConfig().pipe(map(config => nodePath.join(config.outdir, uri.pathname))),
        );
        break;
      default:
        throw new Error(`Invalid path: ${path}`);
    }
  } catch (e) {
    // Treat it as a path.
    return loadContent(observableOf(path));
  }
}

function loadContent(path$: Observable<string>): Observable<string> {
  return path$.pipe(switchMap(path => readFile(path)));
}

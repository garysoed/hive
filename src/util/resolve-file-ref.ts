import * as path from 'path';

import {Vine} from 'grapevine';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {FileRef} from '../core/file-ref';

import {resolveRoot} from './resolve-root';


export function resolveFileRef(vine: Vine, fileref: FileRef, cwd: string): Observable<string> {
  return resolveRoot(vine, fileref.rootType, cwd).pipe(
      map(rootDir => path.join(rootDir, fileref.path)),
  );
}

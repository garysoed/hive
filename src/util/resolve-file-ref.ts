import * as path from 'path';

import { Observable } from '@rxjs';
import { map } from '@rxjs/operators';

import { FileRef } from '../core/file-ref';

import { resolveRoot } from './resolve-root';


export function resolveFileRef(fileref: FileRef, cwd: string): Observable<string> {
  return resolveRoot(fileref.rootType, cwd).pipe(
      map(rootDir => path.join(rootDir, fileref.path)),
  );
}

import * as path from 'path';
import * as process from 'process';

import { assertNonNull } from '@gs-tools/rxjs';
import { Observable, of as observableOf } from '@rxjs';
import { map } from '@rxjs/operators';

import { FileRef } from '../core/file-ref';
import { RootType } from '../core/root-type';
import { findRoot } from '../project/find-root';
import { loadProjectConfig } from '../project/load-project-config';

export function resolveFileRef(fileref: FileRef): Observable<string> {
  return getRoot(fileref.rootType).pipe(
      map(rootDir => path.join(rootDir, fileref.path)),
  );
}

function getRoot(rootType: RootType): Observable<string> {
  switch (rootType) {
    case RootType.CURRENT_DIR:
      return observableOf(process.cwd());
    case RootType.OUT_DIR:
      return loadProjectConfig().pipe(map(config => config.outdir));
    case RootType.PROJECT_ROOT:
      return findRoot().pipe(assertNonNull('Cannot find project root'));
    case RootType.SYSTEM_ROOT:
      return observableOf('/');
  }
}

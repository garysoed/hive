import * as path from 'path';

import { assertNonNull } from '@gs-tools/rxjs';
import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { map } from '@rxjs/operators';

import { RootType } from '../core/root-type';
import { findRoot } from '../project/find-root';
import { loadProjectConfig } from '../project/load-project-config';


export function resolveRoot(rootType: RootType): Observable<string> {
  switch (rootType) {
    case RootType.CURRENT_DIR:
      return observableOf(process.cwd());
    case RootType.OUT_DIR:
      return combineLatest([
        loadProjectConfig(),
        findRoot(),
      ])
      .pipe(
          map(([config, root]) => {
            if (path.isAbsolute(config.outdir)) {
              return config.outdir;
            }
            return path.join(root || '', config.outdir);
          }),
      );
    case RootType.PROJECT_ROOT:
      return findRoot().pipe(assertNonNull('Cannot find project root'));
    case RootType.SYSTEM_ROOT:
      return observableOf('/');
  }
}

import { assertNonNull } from 'gs-tools/export/rxjs';
import * as path from 'path';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { BuiltInRootType, RootType } from '../core/root-type';
import { findRoot } from '../project/find-root';
import { loadProjectConfig } from '../project/load-project-config';


export function resolveRoot(rootType: RootType, cwd: string): Observable<string> {
  switch (rootType) {
    case BuiltInRootType.CURRENT_DIR:
      return observableOf(cwd);
    case BuiltInRootType.OUT_DIR:
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
    case BuiltInRootType.PROJECT_ROOT:
      return findRoot().pipe(assertNonNull('Cannot find project root'));
    case BuiltInRootType.SYSTEM_ROOT:
      return observableOf('/');
    default:
      return loadProjectConfig().pipe(
          map(config => config.roots.get(rootType) || null),
          assertNonNull(`Cannot find root type: ${rootType}`),
      );
  }
}

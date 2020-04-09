import { mapNonNull } from 'gs-tools/export/rxjs';
import * as path from 'path';
import { Observable } from 'rxjs';

import { findRoot } from './find-root';


export const TMP_DIR_NAME = '.hive';

export function getProjectTmpDir(): Observable<string|null> {
  return findRoot().pipe(
      mapNonNull(projectDir => {
        return path.join(projectDir, TMP_DIR_NAME);
      }),
  );
}

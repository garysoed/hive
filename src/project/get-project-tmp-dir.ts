import * as path from 'path';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {findRoot} from './find-root';


export const TMP_DIR_NAME = '.hive';

export function getProjectTmpDir(): Observable<string|null> {
  return findRoot().pipe(
      map(projectDir => {
        if (!projectDir) {
          return null;
        }

        return path.join(projectDir, TMP_DIR_NAME);
      }),
  );
}

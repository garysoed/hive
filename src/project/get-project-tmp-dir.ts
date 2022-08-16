import * as path from 'path';

import {Vine} from 'grapevine';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {findRoot} from './find-root';


export const TMP_DIR_NAME = '.hive';

export function getProjectTmpDir(vine: Vine): Observable<string|null> {
  return findRoot(vine).pipe(
      map(projectDir => {
        if (!projectDir) {
          return null;
        }

        return path.join(projectDir, TMP_DIR_NAME);
      }),
  );
}

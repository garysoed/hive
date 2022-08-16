import * as path from 'path';

import {Vine} from 'grapevine';
import {Observable, throwError} from 'rxjs';
import {map, share, switchMap} from 'rxjs/operators';

import {readFile} from '../util/read-file';

import {findRoot, ROOT_FILE_NAME} from './find-root';
import {parseProject} from './parse-project';
import {ProjectConfig} from './project-config';

export function loadProjectConfig(vine: Vine): Observable<ProjectConfig> {
  return findRoot(vine).pipe(
      switchMap(rootPath => {
        if (!rootPath) {
          return throwError(() => new Error('No root folder found'));
        }

        return readFile(vine, path.join(rootPath, ROOT_FILE_NAME)).pipe(
            map(configStr => parseProject(configStr, rootPath)),
        );
      }),
      share(),
  );
}

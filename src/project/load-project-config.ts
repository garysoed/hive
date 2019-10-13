import * as path from 'path';

import { Observable, throwError } from '@rxjs';
import { map, share, switchMap } from '@rxjs/operators';

import { readFile } from '../util/read-file';

import { findRoot, ROOT_FILE_NAME } from './find-root';
import { parseProject } from './parse-project';
import { ProjectConfig } from './project-config';

export function loadProjectConfig(): Observable<ProjectConfig> {
  return findRoot().pipe(
      switchMap(rootPath => {
        if (!rootPath) {
          return throwError(new Error('No root folder found'));
        }

        return readFile(path.join(rootPath, ROOT_FILE_NAME));
      }),
      map(configStr => {
        return parseProject(configStr);
      }),
      share(),
  );
}

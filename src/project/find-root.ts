import * as path from 'path';

import {Vine} from 'grapevine';
import {FsLike} from 'gs-testing/export/fake';
import {concat, fromEventPattern, Observable} from 'rxjs';
import {find, map, share, take} from 'rxjs/operators';

import {$fs} from '../external/fs';
import {$process} from '../external/process';


export const ROOT_FILE_NAME = 'hive_project.json';

export function findRoot(vine: Vine): Observable<string|null> {
  const fs = $fs.get(vine);
  const process = $process.get(vine);

  // Generate the paths to the root.
  let curr = process.cwd();
  const dirs: string[] = [curr];
  while (path.parse(curr).root !== curr) {
    curr = path.join(curr, '..');
    dirs.push(curr);
  }

  const hasConfigs = dirs.map(dir => hasProjectConfig(fs, dir).pipe(map(has => has ? dir : null)));
  return concat(...hasConfigs)
      .pipe(
          find(dir => !!dir),
          map(v => v || null),
          share(),
      );
}

function hasProjectConfig(fs: FsLike, dir: string): Observable<boolean> {
  return fromEventPattern<{}>(
      handler => fs.access(
          path.join(dir, ROOT_FILE_NAME),
          fs.constants.R_OK,
          err => handler(err),
      ),
  )
      .pipe(
          map(err => !err),
          take(1),
      );
}

import * as fs from 'fs';

import { fromEventPattern, Observable } from '@rxjs';
import { startWith, switchMap, tap } from '@rxjs/operators';

import { LOGGER } from '../cli/logger';

export function readFile(filepath: string): Observable<string> {
  return fromEventPattern(
      handler => {
        return fs.watch(filepath, () => {
          handler({});
        });
      },
      (_handler, watcher: fs.FSWatcher) => {
        watcher.close();
      },
  )
  .pipe(
      tap(() => LOGGER.info('', `Detected change to: ${filepath}`)),
      startWith({}),
      switchMap(() => {
        return new Observable<string>(subscriber => {
          fs.readFile(filepath, {encoding: 'utf8'}, (err, data) => {
            if (err) {
              subscriber.error(err);
            } else {
              subscriber.next(data);
              subscriber.complete();
            }
          });
        });
      }),
  );
}

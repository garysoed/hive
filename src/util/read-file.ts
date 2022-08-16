import {Vine} from 'grapevine';
import {FsWatcherLike} from 'gs-testing/export/fake';
import {fromEventPattern, Observable} from 'rxjs';
import {startWith, switchMap, tap} from 'rxjs/operators';
import {Logger} from 'santa';

import {$fs} from '../external/fs';

const LOGGER = new Logger('@hive/util/read-file');

export function readFile(
    vine: Vine,
    filepath: string,
): Observable<string> {
  const fs = $fs.get(vine);
  return fromEventPattern(
      handler => {
        return fs.watch(filepath, () => {
          handler({});
        });
      },
      (_handler, watcher: FsWatcherLike) => {
        watcher.close();
      },
  )
      .pipe(
          tap(() => LOGGER.progress(`\nDetected change to: ${filepath}`)),
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

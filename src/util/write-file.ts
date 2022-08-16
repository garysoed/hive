import * as path from 'path';

import {Vine} from 'grapevine';
import {Observable} from 'rxjs';

import {$fs} from '../external/fs';

export function writeFile(
    vine: Vine,
    filepath: string,
    content: string,
): Observable<void> {
  const fs = $fs.get(vine);
  return new Observable<void>(subscriber => {
    fs.mkdir(path.dirname(filepath), {recursive: true}, err => {
      if (err) {
        subscriber.error(err);
        return;
      }

      fs.writeFile(filepath, content, {encoding: 'utf8'}, err => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next();
          subscriber.complete();
        }
      });
    });
  });
}

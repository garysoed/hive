import * as fs from 'fs';

import { Observable } from '@rxjs';

export function readFile(path: string): Observable<string> {
  return new Observable<string>(subscriber => {
    fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
      if (err) {
        subscriber.error(err);
      } else {
        subscriber.next(data);
        subscriber.complete();
      }
    });
  });
}

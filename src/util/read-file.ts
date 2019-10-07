import * as fs from 'fs';

import { Observable } from '@rxjs';

export function readFile(filepath: string): Observable<string> {
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
}

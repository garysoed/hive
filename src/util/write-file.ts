import * as fs from 'fs';
import * as path from 'path';

import { Observable } from '@rxjs';

export function writeFile(filepath: string, content: string): Observable<void> {
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

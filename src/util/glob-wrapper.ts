import * as glob from 'glob';
import { Observable } from 'rxjs';

export const globWrapper = {
  glob(pattern: string, options: glob.IOptions): Observable<string[]> {
    return new Observable<string[]>(subscriber => {
      glob(pattern, options, (err, matches) => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next(matches);
        }
      });
    });
  },
};

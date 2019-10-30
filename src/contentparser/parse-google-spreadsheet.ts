import { google } from 'googleapis';

import { from as observableFrom, Observable } from '@rxjs';
import { filter, map, switchMap } from '@rxjs/operators';
import { logDestination } from '@santa';

import { ConsoleDestination } from '../cli/console-destination';

import { GoogleOauth } from './google-oauth';
import { GoogleSpreadsheet } from './google-spreadsheet';


const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export function parseGoogleSpreadSheet(
    str: string,
    oauth: GoogleOauth,
): Observable<GoogleSpreadsheet> {
  oauth.addScope(SCOPE);
  return oauth.auth
      .pipe(
          filter(({scopes}) => scopes.has(SCOPE)),
          switchMap(({client}) => {
            const gSheets = google.sheets({version: 'v4', auth: client});
            return observableFrom(gSheets.spreadsheets.get({
              spreadsheetId: '1VeQrzTz2ibWrN8bRQ1mJbck8vLY7U_ZMtir3lAHDHe0',
            }));
          }),
          map(response => {
            return {title: response.data.sheets![0].properties!.title};
          }),
      );
}

logDestination.set(new ConsoleDestination());

parseGoogleSpreadSheet(
    '',
    new GoogleOauth(
        '425591565764-len818a3riq4c3bii38hpai3s5o7aqd5.apps.googleusercontent.com',
        'C2-d4uXufbi8uk54jJGIeDUT',
    ))
    .subscribe(result => console.log(JSON.stringify(result)));

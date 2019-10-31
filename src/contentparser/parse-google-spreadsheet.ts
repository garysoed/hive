import { google } from 'googleapis';

import { debug } from '@gs-tools/rxjs';
import { from as observableFrom, Observable } from '@rxjs';
import { filter, map, switchMap } from '@rxjs/operators';
import { logDestination } from '@santa';

import { ConsoleDestination } from '../cli/console-destination';

import { GoogleOauth } from './google-oauth';
import { GoogleSpreadsheet } from './google-spreadsheet';


const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export function parseGoogleSpreadSheet(
    content: string,
    oauth: GoogleOauth,
): Observable<GoogleSpreadsheet> {
  oauth.addScope(SCOPE);
  oauth.addScope('https://www.googleapis.com/auth/drive.readonly');
  const ref = parseRefFile(content);

  return oauth.auth
      .pipe(
          filter(({scopes}) => scopes.has(SCOPE)),
          switchMap(({client}) => {
            const gSheets = google.sheets({version: 'v4', auth: client});
            return observableFrom(gSheets.spreadsheets.get({
              spreadsheetId: ref.doc_id,
            }));
          }),
          map(response => {
            return {title: response.data.sheets![0].properties!.title};
          }),
      );
}

logDestination.set(new ConsoleDestination());

interface GoogleSpreadsheetRef {
  doc_id: string;
}

function parseRefFile(content: string): GoogleSpreadsheetRef {
  const json = JSON.parse(content) as Partial<GoogleSpreadsheetRef>;
  if (typeof json.doc_id !== 'string') {
    throw new Error(`Invalid Google Spreadsheet file`);
  }

  return json as GoogleSpreadsheetRef;
}

parseGoogleSpreadSheet(
    '{"doc_id": "1VeQrzTz2ibWrN8bRQ1mJbck8vLY7U_ZMtir3lAHDHe0"}',
    new GoogleOauth(
        '425591565764-len818a3riq4c3bii38hpai3s5o7aqd5.apps.googleusercontent.com',
        'C2-d4uXufbi8uk54jJGIeDUT',
    ))
    .subscribe(result => console.log(JSON.stringify(result)));

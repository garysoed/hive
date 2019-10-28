import { google } from 'googleapis';

import { EMPTY, Observable } from '@rxjs';
import {GoogleSpreadsheet} from './google-spreadsheet';

export function parseGoogleSpreadSheet(str: string): Observable<GoogleSpreadsheet> {
  const oauth2Client = new google.auth.OAuth2(
    '425591565764-len818a3riq4c3bii38hpai3s5o7aqd5.apps.googleusercontent.com',
    'C2-d4uXufbi8uk54jJGIeDUT',
    'urn:ietf:wg:oauth:2.0:oob',
  );

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  console.log(url);

  google.sheets({version: 'v4'});
  return EMPTY;
}

parseGoogleSpreadSheet('');

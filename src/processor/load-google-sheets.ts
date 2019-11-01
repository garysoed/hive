import { google, sheets_v4 } from 'googleapis';

import { from as observableFrom, Observable } from '@rxjs';
import { filter, map, switchMap } from '@rxjs/operators';

import { GoogleSheetsMetadata } from '../contentparser/google-sheets-metadata';

import { GoogleOauth } from './google-oauth';


export const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export function loadGoogleSheets(
    metadata: GoogleSheetsMetadata,
    ranges: string[],
    oauth: GoogleOauth,
): Observable<sheets_v4.Schema$Spreadsheet> {
  oauth.addScope(SCOPE);
  return oauth.auth
      .pipe(
          filter(({scopes}) => scopes.has(SCOPE)),
          switchMap(({client}) => {
            const gSheets = google.sheets({version: 'v4', auth: client});
            return observableFrom(
                gSheets.spreadsheets.get({
                  includeGridData: true,
                  spreadsheetId: metadata.doc_id,
                  ranges,
                }),
            );
          }),
          map(({data}) => data),
      );
}

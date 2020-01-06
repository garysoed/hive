import { google, sheets_v4 } from 'googleapis';

import { arrayOfType, stringType, Type } from '@gs-types';
import { from as observableFrom, Observable } from '@rxjs';
import { filter, map, switchMap } from '@rxjs/operators';

import { GOOGLE_SHEETS_METADATA_TYPE, GoogleSheetsMetadata } from '../contentparser/google-sheets-metadata';
import { Processor } from '../core/processor';

import { DEFAULT_GOOGLE_OAUTH_FACTORY, GoogleOauthFactory } from './google-oauth';


export const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export function loadGoogleSheets(
    metadata: GoogleSheetsMetadata,
    ranges: string[],
    clientId: string,
    clientSecret: string,
    googleOauthFactory: GoogleOauthFactory = DEFAULT_GOOGLE_OAUTH_FACTORY,
): Observable<sheets_v4.Schema$Spreadsheet> {
  const oauth = googleOauthFactory(clientId, clientSecret);
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


export const LOAD_GOOGLE_SHEETS: Processor = {
  fn: inputs => {
    const metadata = inputs.get('metadata');
    const ranges = inputs.get('ranges');
    const clientId = inputs.get('clientId');
    const clientSecret = inputs.get('clientSecret');

    return loadGoogleSheets(metadata, ranges, clientId, clientSecret);
  },
  inputs: new Map<string, Type<unknown>>([
    ['metadata', GOOGLE_SHEETS_METADATA_TYPE],
    ['ranges', arrayOfType(stringType)],
    ['clientId', stringType],
    ['clientSecret', stringType],
  ]),
};

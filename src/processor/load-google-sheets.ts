import { google } from 'googleapis';

import { arrayOfType, instanceofType, stringType, Type } from '@gs-types';
import { from as observableFrom } from '@rxjs';
import { filter, map, switchMap, take } from '@rxjs/operators';

import { fromType } from '../config/serializer/serializer';
import { Processor } from '../core/processor';
import { GOOGLE_SHEETS_METADATA_TYPE, GoogleSheetsMetadata } from '../thirdparty/google-sheets-metadata';

import { DEFAULT_GOOGLE_OAUTH_FACTORY, GoogleOauthFactory } from './google-oauth';
import { ProcessorSpec } from './processor-spec';


export const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export async function loadGoogleSheets(
    metadata: GoogleSheetsMetadata,
    ranges: string[],
    clientId: string,
    clientSecret: string,
    googleOauthFactory: GoogleOauthFactory = DEFAULT_GOOGLE_OAUTH_FACTORY,
): Promise<object> {
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
          take(1),
      )
      .toPromise();
}

const RANGES_TYPE: Type<string[]> = arrayOfType(stringType);
const SPEC = new ProcessorSpec({
  'metadata': GOOGLE_SHEETS_METADATA_TYPE,
  'ranges': RANGES_TYPE,
  'oauth.clientId': stringType,
  'oauth.clientSecret': stringType,
});

export const LOAD_GOOGLE_SHEETS: Processor = {
  fn: async inputs => {
    const validatedInputs = SPEC.checkInputs(inputs);

    return loadGoogleSheets(
        validatedInputs.metadata,
        validatedInputs.ranges,
        validatedInputs['oauth.clientId'],
        validatedInputs['oauth.clientSecret'],
    );
  },
  inputs: SPEC.getInputsMap(),
  output: fromType(instanceofType(Object)),
};

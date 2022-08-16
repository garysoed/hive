import {google} from 'googleapis';
import {Vine} from 'grapevine';
import {Merge, RawSheet} from 'gs-tools/export/gapi';
import {arrayOfType, booleanType, instanceofType, numberType, stringType, Type} from 'gs-types';
import {firstValueFrom, from as observableFrom} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';

import {fromType} from '../config/serializer/serializer';
import {Processor} from '../core/processor';
import {GoogleSheetsMetadata, GOOGLE_SHEETS_METADATA_TYPE} from '../thirdparty/google-sheets-metadata';

import {$googleOauthFactory} from './google-oauth';
import {ProcessorSpec} from './processor-spec';


export const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export async function loadGoogleSheets(
    vine: Vine,
    metadata: GoogleSheetsMetadata,
    ranges: string[],
    clientId: string,
    clientSecret: string,
): Promise<readonly RawSheet[]> {
  const googleOauthFactory = $googleOauthFactory.get(vine);
  const oauth = googleOauthFactory(clientId, clientSecret);
  oauth.addScope(SCOPE);
  return firstValueFrom(oauth.auth
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
          map(({data}) => {
            return (data.sheets ?? []).map(sheet => {
              const merges = (sheet.merges ?? [])
                  .map(merge => {
                    const {startRowIndex, endRowIndex} = merge;
                    const {startColumnIndex, endColumnIndex} = merge;
                    if (!numberType.check(startRowIndex)
                        || !numberType.check(endRowIndex)
                        || !numberType.check(startColumnIndex)
                        || !numberType.check(endColumnIndex)) {
                      return null;
                    }

                    return {startRowIndex, endRowIndex, startColumnIndex, endColumnIndex};
                  })
                  .filter((merge): merge is Merge => !!merge);

              const data = (sheet.data ?? [])
                  .map(data => {
                    const rowData = (data.rowData ?? []).map(data => {
                      const values = (data.values ?? []).map(value => {
                        const boolValue = value.effectiveValue?.boolValue;
                        const numberValue = value.effectiveValue?.numberValue;
                        const stringValue = value.effectiveValue?.stringValue;
                        const effectiveValue = {
                          boolValue: booleanType.check(boolValue) ? boolValue : undefined,
                          numberValue: numberType.check(numberValue) ? numberValue : undefined,
                          stringValue: stringType.check(stringValue) ? stringValue : undefined,
                        };

                        return {effectiveValue};
                      });

                      return {values};
                    });

                    return {rowData};
                  });
              return {merges, data};
            });
          }),
      ));
}

const RANGES_TYPE: Type<readonly string[]> = arrayOfType(stringType);
const SPEC = new ProcessorSpec({
  'metadata': GOOGLE_SHEETS_METADATA_TYPE,
  'ranges': RANGES_TYPE,
  'oauth.clientId': stringType,
  'oauth.clientSecret': stringType,
});

export const LOAD_GOOGLE_SHEETS: Processor = {
  fn: async (vine, inputs) => {
    const validatedInputs = SPEC.checkInputs(inputs);

    return loadGoogleSheets(
        vine,
        validatedInputs.metadata,
        [...validatedInputs.ranges],
        validatedInputs['oauth.clientId'],
        validatedInputs['oauth.clientSecret'],
    );
  },
  inputs: SPEC.getInputsMap(),
  output: fromType(instanceofType(Object)),
};

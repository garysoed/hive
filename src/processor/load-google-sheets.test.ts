import {GaxiosResponse} from 'gaxios';
import {google, sheets_v4} from 'googleapis';
import {Vine} from 'grapevine';
import {Spy, arrayThat, assert, createSpy, createSpyInstance, createSpyObject, fake, objectThat, should, spy, test} from 'gs-testing';
import {Merge, RawSheet} from 'gs-tools/export/gapi';
import {CellData, ExtendedValue, GridData, RowData} from 'gs-tools/src/gapi/type/sheets';
import {of as observableOf} from 'rxjs';

import {$googleOauthFactory, GoogleOauth} from './google-oauth';
import {SCOPE, loadGoogleSheets} from './load-google-sheets';


test('@hive/processor/load-google-sheets', () => {
  should('emit the correct data', async () => {
    const docId = 'docId';
    const metadata = {doc_id: docId};
    const ranges = ['range1', 'range2'];

    const mockSpreadsheets
        = createSpyObject<sheets_v4.Resource$Spreadsheets>('Spreadsheets', ['get']);
    const data = {
      sheets: [
        {
          merges: [
            {startRowIndex: 0, endRowIndex: 1, startColumnIndex: 2, endColumnIndex: 3},
            {},
          ],
        },
        {
          data: [
            {
              rowData: [
                {
                  values: [
                    {effectiveValue: {boolValue: true}},
                    {effectiveValue: {numberValue: 12}},
                    {effectiveValue: {stringValue: 'str'}},
                  ],
                },
                {},
              ],
            },
            {},
          ],
        },
        {},
      ],
    };
    const mockGet = mockSpreadsheets.get as unknown as
        Spy<Promise<GaxiosResponse<sheets_v4.Schema$Spreadsheet>>, [any]>;
    fake(mockGet).always().return(Promise.resolve({
      config: {},
      status: 0,
      statusText: '',
      headers: [],
      data,
      request: {responseURL: 'request'},
    }));

    const spyGoogleSheets = spy(google, 'sheets');
    fake(spyGoogleSheets).always().return({spreadsheets: mockSpreadsheets} as any);

    const mockGoogleOauth = createSpyInstance(GoogleOauth);
    const mockClient = 'client';
    const mockAuth = createSpy('auth');
    Object.defineProperty(mockGoogleOauth, 'auth', {get: mockAuth});
    fake(mockAuth).always()
        .return(observableOf({scopes: new Set([SCOPE]), client: mockClient} as any));

    const vine = new Vine({
      overrides: [
        {override: $googleOauthFactory, withValue: () => mockGoogleOauth},
      ],
    });

    const spreadsheet
        = await loadGoogleSheets(vine, metadata, ranges, 'clientId', 'clientSecret');

    assert(spreadsheet).to.haveExactElements([
      objectThat<RawSheet>().haveProperties({
        merges: arrayThat<Merge>().haveExactElements([
          objectThat<Merge>().haveProperties({
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 2,
            endColumnIndex: 3,
          }),
        ]),
        data: arrayThat<GridData>().beEmpty(),
      }),
      objectThat<RawSheet>().haveProperties({
        data: arrayThat<GridData>().haveExactElements([
          objectThat<GridData>().haveProperties({
            rowData: arrayThat<RowData>().haveExactElements([
              objectThat<RowData>().haveProperties({
                values: arrayThat<CellData>().haveExactElements([
                  objectThat<CellData>().haveProperties({
                    effectiveValue: objectThat<ExtendedValue>().haveProperties({boolValue: true}),
                  }),
                  objectThat<CellData>().haveProperties({
                    effectiveValue: objectThat<ExtendedValue>().haveProperties({numberValue: 12}),
                  }),
                  objectThat<CellData>().haveProperties({
                    effectiveValue: objectThat<ExtendedValue>()
                        .haveProperties({stringValue: 'str'}),
                  }),
                ]),
              }),
              objectThat<RowData>().haveProperties({}),
            ]),
          }),
          objectThat<GridData>().haveProperties({}),
        ]),
      }),
      objectThat<RawSheet>().haveProperties({}),
    ]);
    assert(mockGet).to.haveBeenCalledWith(objectThat().haveProperties({
      spreadsheetId: docId,
      ranges,
    }));
    assert(spyGoogleSheets).to.haveBeenCalledWith(objectThat<sheets_v4.Options>().haveProperties({
      auth: mockClient,
    }));
    assert(mockGoogleOauth.addScope).to.haveBeenCalledWith(SCOPE);
  });
});

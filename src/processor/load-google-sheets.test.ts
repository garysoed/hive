import { GaxiosResponse } from 'gaxios';
import { google, sheets_v4 } from 'googleapis';
import { arrayThat, assert, createSpy, createSpyInstance, createSpyObject, fake, objectThat, should, spy, Spy, test } from 'gs-testing';
import { Observable, of as observableOf } from 'rxjs';

import { GoogleOauth } from './google-oauth';
import { loadGoogleSheets, SCOPE } from './load-google-sheets';


test('@hive/processor/load-google-sheets', () => {
  should(`emit the correct data`, async () => {
    const docId = 'docId';
    const metadata = {doc_id: docId};
    const ranges = ['range1', 'range2'];

    const mockSpreadsheets =
        createSpyObject<sheets_v4.Resource$Spreadsheets>('Spreadsheets', ['get']);
    const data = {sheets: [{}, {}, {}]};
    const mockGet = mockSpreadsheets.get as unknown as
        Spy<Observable<GaxiosResponse<sheets_v4.Schema$Spreadsheet>>, [any]>;
    fake(mockGet).always().return(observableOf({
      config: {},
      status: 0,
      statusText: '',
      headers: [],
      data,
    }));

    const spyGoogleSheets = spy(google, 'sheets');
    fake(spyGoogleSheets).always().return({spreadsheets: mockSpreadsheets} as any);

    const mockGoogleOauth = createSpyInstance(GoogleOauth);
    const mockClient = {};
    const mockAuth = createSpy('auth');
    Object.defineProperty(mockGoogleOauth, 'auth', {get: mockAuth});
    fake(mockAuth).always()
        .return(observableOf({scopes: new Set([SCOPE]), client: mockClient} as any));

    const spreadsheet =
        await loadGoogleSheets(metadata, ranges, 'clientId', 'clientSecret', () => mockGoogleOauth);

    assert(spreadsheet).to.equal(objectThat().haveProperties({
      sheets: arrayThat().haveExactElements([
        objectThat().haveProperties({}),
        objectThat().haveProperties({}),
        objectThat().haveProperties({}),
      ]),
    }));
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

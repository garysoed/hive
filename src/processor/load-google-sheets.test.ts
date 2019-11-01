import { GaxiosResponse } from 'gaxios';
import { google, sheets_v4 } from 'googleapis';

import { assert, createSpy, createSpyInstance, createSpyObject, fake, objectThat, setup, should, spy, Spy, test, TestScheduler } from '@gs-testing';
import { Observable, of as observableOf, ReplaySubject } from '@rxjs';

import { GoogleOauth } from './google-oauth';
import { loadGoogleSheets, SCOPE } from './load-google-sheets';


test('@hive/processor/load-google-sheets', () => {
  should(`emit the correct data`, () => {
    const docId = 'docId';
    const metadata = {doc_id: docId};
    const ranges = ['range1', 'range2'];

    const mockSpreadsheets =
        createSpyObject<sheets_v4.Resource$Spreadsheets>('Spreadsheets', ['get']);
    const data = {};
    const mockGet = mockSpreadsheets.get as unknown as
        Spy<Observable<GaxiosResponse<sheets_v4.Schema$Spreadsheet>>>;
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

    const spreadsheet$ = new ReplaySubject<sheets_v4.Schema$Spreadsheet>(1);
    loadGoogleSheets(metadata, ranges, mockGoogleOauth).subscribe(spreadsheet$);

    assert(spreadsheet$).to.emitSequence([data]);
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

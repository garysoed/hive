import { GenerateAuthUrlOpts, GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import { OAuth2Client } from 'googleapis-common';
import * as readline from 'readline';

import { assert, createSpyObject, fake, match, setup, should, Spy, spy, SpyObj, test, TestScheduler } from '@gs-testing';
import { of as observableOf, ReplaySubject } from '@rxjs';

import { GoogleAuth, GoogleOauth } from './google-oauth';

test('@hive/contentparser/google-oauth', () => {
  const CLIENT_ID = 'clientId';
  const CLIENT_SECRET = 'clientSecret';

  let mockOauthClient: SpyObj<OAuth2Client>;
  let scheduler: TestScheduler;
  let oauth: GoogleOauth;

  setup(() => {
    scheduler = new TestScheduler();
    mockOauthClient = createSpyObject<OAuth2Client>(
      'OauthClient',
      [
        'generateAuthUrl',
        'getToken',
        'setCredentials',
      ],
  );
    oauth = new GoogleOauth(
        CLIENT_ID,
        CLIENT_SECRET,
        () => mockOauthClient,
        scheduler,
    );
  });

  test('setupOnScopeChange', () => {
    should(`add the new token and emit if a scope was added`, () => {
      const tokens = {};
      fake(mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .always()
          .return(observableOf({tokens}) as any);
      const auth$ = new ReplaySubject<GoogleAuth>(1);
      oauth.auth.subscribe(auth$);

      const mockReadlineInterface = createSpyObject<readline.Interface>(
          'ReadlineInterface',
          ['question'],
      );
      const code = 'code';
      fake(mockReadlineInterface.question).always().call((_question, callback) => {
        callback(code);
      });
      fake(spy(readline, 'createInterface')).always().return(mockReadlineInterface);


      const scope1 = 'scope1';
      const scope2 = 'scope2';
      oauth.addScope(scope1);
      oauth.addScope(scope2);

      scheduler.tick(50);

      assert(auth$).to.emitSequence([match.anyObjectThat<GoogleAuth>().haveProperties({
        client: mockOauthClient,
        scopes: match.anySetThat<string>().haveExactElements(new Set([scope1, scope2])),
      })]);
      assert(mockOauthClient.setCredentials).to.haveBeenCalledWith(tokens);
      assert(mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .to.haveBeenCalledWith(code);
      assert(mockOauthClient.generateAuthUrl).to.haveBeenCalledWith(
          match.anyObjectThat<GenerateAuthUrlOpts>().haveProperties({
            scope: match.anyArrayThat<string>().haveExactElements([scope1, scope2]),
          }));
    });
  });
});

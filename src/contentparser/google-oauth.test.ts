import { GenerateAuthUrlOpts, GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import { OAuth2Client } from 'googleapis-common';
import * as path from 'path';
import * as readline from 'readline';

import { assert, createSpyObject, fake, match, resetCalls, setup, should, spy, Spy, SpyObj, test, TestScheduler } from '@gs-testing';
import { filterNonNull } from '@gs-tools/rxjs';
import { of as observableOf, ReplaySubject } from '@rxjs';
import { map } from '@rxjs/operators';

import { ROOT_FILE_NAME } from '../project/find-root';
import { TMP_DIR_NAME } from '../project/get-project-tmp-dir';
import { addFile, deleteFile, getFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { CredentialsFile, GoogleAuth, GoogleOauth, OAUTH_FILE } from './google-oauth';


test('@hive/contentparser/google-oauth', () => {
  const ROOT_DIR = '/';
  const CLIENT_ID = 'clientId';
  const CLIENT_SECRET = 'clientSecret';

  let mockOauthClient: SpyObj<OAuth2Client>;
  let scheduler: TestScheduler;

  function createOauth(): GoogleOauth {
    return new GoogleOauth(
        CLIENT_ID,
        CLIENT_SECRET,
        () => mockOauthClient,
        scheduler,
    );
  }

  setup(() => {
    mockFs();
    mockProcess();

    // Create root project.
    setCwd(ROOT_DIR);
    const content = `
    globals:
    outdir: out/
    `;
    addFile(path.join(ROOT_DIR, ROOT_FILE_NAME), {content});

    scheduler = new TestScheduler();
    mockOauthClient = createSpyObject<OAuth2Client>(
        'OauthClient',
        [
          'generateAuthUrl',
          'getToken',
          'setCredentials',
        ],
    );
  });

  test('initializeAddedScopes', () => {
    should(`initialize using credentials from the oauth file`, () => {
      const scope1 = 'scope1';
      const scope2 = 'scope2';
      const scope = [scope1, scope2].join(' ');

      const content = JSON.stringify({scope});
      addFile(path.join(ROOT_DIR, TMP_DIR_NAME, OAUTH_FILE), {content});

      const auth$ = new ReplaySubject<GoogleAuth>(1);
      createOauth().auth.subscribe(auth$);

      assert(auth$).to.emitSequence([match.anyObjectThat<GoogleAuth>().haveProperties({
        client: mockOauthClient,
        scopes: match.anySetThat<string>().haveExactElements(new Set([scope1, scope2])),
      })]);
      assert(mockOauthClient.setCredentials).to.haveBeenCalledWith(
          match.anyObjectThat<CredentialsFile>().haveProperties({
            scope,
          }));
    });

    should(`skip initialization if oauth file cannot be found`, () => {
      const auth$ = new ReplaySubject<GoogleAuth>(1);
      createOauth().auth.subscribe(auth$);

      assert(auth$).to.emitSequence([match.anyObjectThat<GoogleAuth>().haveProperties({
        client: mockOauthClient,
        scopes: match.anySetThat<string>().beEmpty(),
      })]);
      assert(mockOauthClient.setCredentials).toNot.haveBeenCalled();
    });

    should(`skip initialization if tmp dir cannot be found`, () => {
      deleteFile(path.join(ROOT_DIR, ROOT_FILE_NAME));

      const auth$ = new ReplaySubject<GoogleAuth>(1);
      createOauth().auth.subscribe(auth$);

      assert(auth$).to.emitSequence([match.anyObjectThat<GoogleAuth>().haveProperties({
        client: mockOauthClient,
        scopes: match.anySetThat<string>().beEmpty(),
      })]);
      assert(mockOauthClient.setCredentials).toNot.haveBeenCalled();
    });
  });

  test('setupOnScopeChange', () => {
    should(`add the new token and emit if a scope was added`, () => {
      const tokens = {};
      fake(mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .always()
          .return(observableOf({tokens}) as any);
      const auth$ = new ReplaySubject<GoogleAuth>(1);
      const oauth = createOauth();
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

    should(`not prompt if scope has been added through initialization`, () => {
      const scope1 = 'scope1';
      const scope2 = 'scope2';
      const scope = [scope1, scope2].join(' ');

      const content = JSON.stringify({scope});
      addFile(path.join(ROOT_DIR, TMP_DIR_NAME, OAUTH_FILE), {content});

      const auth$ = new ReplaySubject<GoogleAuth>(1);
      const oauth = createOauth();
      oauth.auth.subscribe(auth$);

      resetCalls(mockOauthClient.setCredentials);

      oauth.addScope(scope1);
      scheduler.tick(50);

      assert(auth$).to.emitSequence([match.anyObjectThat<GoogleAuth>().haveProperties({
        client: mockOauthClient,
        scopes: match.anySetThat<string>().haveExactElements(new Set([scope1, scope2])),
      })]);
      assert(mockOauthClient.setCredentials).toNot.haveBeenCalled();
      assert(mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .toNot.haveBeenCalled();
      assert(mockOauthClient.generateAuthUrl).toNot.haveBeenCalled();
    });
  });

  test('setupOnUpdateTmpDir', () => {
    should(`update the oauth file after prompting`, () => {
      const tokens = {scope: 'scope1 scope2'};
      fake(mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .always()
          .return(observableOf({tokens}) as any);
      const auth$ = new ReplaySubject<GoogleAuth>(1);
      const oauth = createOauth();
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

      const scope = 'scope';
      oauth.addScope(scope);

      scheduler.tick(50);

      const oauthContent = getFile(path.join(ROOT_DIR, TMP_DIR_NAME, OAUTH_FILE))!.content;
      assert(oauthContent).to.equal(JSON.stringify(tokens));
    });
  });
});

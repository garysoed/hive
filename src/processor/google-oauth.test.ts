import * as path from 'path';

import {GenerateAuthUrlOpts, GetTokenResponse} from 'google-auth-library/build/src/auth/oauth2client';
import {OAuth2Client} from 'googleapis-common';
import {Vine} from 'grapevine';
import {arrayThat, assert, createSpyObject, fake, mockTime, objectThat, resetCalls, setThat, should, Spy, test, setup} from 'gs-testing';
import {FakeFs, FakeProcess, FakeReadline} from 'gs-testing/export/fake';
import {of as observableOf, ReplaySubject} from 'rxjs';

import {$fs} from '../external/fs';
import {$process} from '../external/process';
import {$readline} from '../external/readline';
import {ROOT_FILE_NAME} from '../project/find-root';
import {TMP_DIR_NAME} from '../project/get-project-tmp-dir';

import {CredentialsFile, GoogleAuth, GoogleOauth, OAUTH_FILE} from './google-oauth';


test('@hive/processor/google-oauth', () => {
  const ROOT_DIR = '/';
  const CLIENT_ID = 'clientId';
  const CLIENT_SECRET = 'clientSecret';

  function createOauth(vine: Vine): GoogleOauth {
    return new GoogleOauth(
        vine,
        CLIENT_ID,
        CLIENT_SECRET,
        () => _.mockOauthClient,
    );
  }

  const _ = setup(() => {
    const fakeFs = new FakeFs();
    const fakeProcess = new FakeProcess();
    const fakeReadline = new FakeReadline();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $fs, withValue: fakeFs},
        {override: $process, withValue: fakeProcess},
        {override: $readline, withValue: fakeReadline},
      ],
    });

    // Create root project.
    fakeProcess.setCwd(ROOT_DIR);
    const content = `
    globals:
    outdir: out/
    `;
    fakeFs.addFile(path.join(ROOT_DIR, ROOT_FILE_NAME), {content});

    const fakeTime = mockTime(global);
    const mockOauthClient = createSpyObject<OAuth2Client>(
        'OauthClient',
        [
          'generateAuthUrl',
          'getToken',
          'setCredentials',
        ],
    );

    return {fakeFs, fakeReadline, fakeTime, mockOauthClient, vine};
  });

  test('initializeAddedScopes', () => {
    should('initialize using credentials from the oauth file', () => {
      const scope1 = 'scope1';
      const scope2 = 'scope2';
      const scope = [scope1, scope2].join(' ');

      const content = JSON.stringify({scope});
      _.fakeFs.addFile(path.join(ROOT_DIR, TMP_DIR_NAME, OAUTH_FILE), {content});

      const auth$ = new ReplaySubject<GoogleAuth>(1);
      createOauth(_.vine).auth.subscribe(auth$);

      assert(auth$).to.emitSequence([objectThat<GoogleAuth>().haveProperties({
        client: _.mockOauthClient,
        scopes: setThat<string>().haveExactElements(new Set([scope1, scope2])),
      })]);
      assert(_.mockOauthClient.setCredentials).to.haveBeenCalledWith(
          objectThat<CredentialsFile>().haveProperties({
            scope,
          }));
    });

    should('skip initialization if oauth file cannot be found', () => {
      const auth$ = new ReplaySubject<GoogleAuth>(1);
      createOauth(_.vine).auth.subscribe(auth$);

      assert(auth$).to.emitSequence([objectThat<GoogleAuth>().haveProperties({
        client: _.mockOauthClient,
        scopes: setThat<string>().beEmpty(),
      })]);
      assert(_.mockOauthClient.setCredentials).toNot.haveBeenCalled();
    });

    should('skip initialization if tmp dir cannot be found', () => {
      _.fakeFs.deleteFile(path.join(ROOT_DIR, ROOT_FILE_NAME));

      const auth$ = new ReplaySubject<GoogleAuth>(1);
      createOauth(_.vine).auth.subscribe(auth$);

      assert(auth$).to.emitSequence([objectThat<GoogleAuth>().haveProperties({
        client: _.mockOauthClient,
        scopes: setThat<string>().beEmpty(),
      })]);
      assert(_.mockOauthClient.setCredentials).toNot.haveBeenCalled();
    });
  });

  test('setupOnScopeChange', () => {
    should('add the new token and emit if a scope was added', () => {
      const tokens = {};
      fake(_.mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .always()
          .return(observableOf({tokens}) as any);
      const auth$ = new ReplaySubject<GoogleAuth>(1);
      const oauth = createOauth(_.vine);
      oauth.auth.subscribe(auth$);


      const scope1 = 'scope1';
      const scope2 = 'scope2';
      oauth.addScope(scope1);
      oauth.addScope(scope2);

      _.fakeTime.tick(50);

      const code = 'code';
      _.fakeReadline.getLastQuestion()!.answer(code);

      assert(auth$).to.emitSequence([objectThat<GoogleAuth>().haveProperties({
        client: _.mockOauthClient,
        scopes: setThat<string>().haveExactElements(new Set([scope1, scope2])),
      })]);
      assert(_.mockOauthClient.setCredentials).to.haveBeenCalledWith(tokens);
      assert(_.mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .to.haveBeenCalledWith(code);
      assert(_.mockOauthClient.generateAuthUrl).to.haveBeenCalledWith(
          objectThat<GenerateAuthUrlOpts>().haveProperties({
            scope: arrayThat<string>().haveExactElements([scope1, scope2]),
          }));
    });

    should('not prompt if scope has been added through initialization', () => {
      const scope1 = 'scope1';
      const scope2 = 'scope2';
      const scope = [scope1, scope2].join(' ');

      const content = JSON.stringify({scope});
      _.fakeFs.addFile(path.join(ROOT_DIR, TMP_DIR_NAME, OAUTH_FILE), {content});

      const auth$ = new ReplaySubject<GoogleAuth>(1);
      const oauth = createOauth(_.vine);
      oauth.auth.subscribe(auth$);

      resetCalls(_.mockOauthClient.setCredentials);

      oauth.addScope(scope1);
      _.fakeTime.tick(50);

      assert(auth$).to.emitSequence([objectThat<GoogleAuth>().haveProperties({
        client: _.mockOauthClient,
        scopes: setThat<string>().haveExactElements(new Set([scope1, scope2])),
      })]);
      assert(_.mockOauthClient.setCredentials).toNot.haveBeenCalled();
      assert(_.mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .toNot.haveBeenCalled();
      assert(_.mockOauthClient.generateAuthUrl).toNot.haveBeenCalled();
    });
  });

  test('setupOnUpdateTmpDir', () => {
    should('update the oauth file after prompting', () => {
      const tokens = {scope: 'scope1 scope2'};
      fake(_.mockOauthClient.getToken as unknown as Spy<Promise<GetTokenResponse>, [string]>)
          .always()
          .return(observableOf({tokens}) as any);
      const auth$ = new ReplaySubject<GoogleAuth>(1);
      const oauth = createOauth(_.vine);
      oauth.auth.subscribe(auth$);

      const scope = 'scope';
      oauth.addScope(scope);

      _.fakeTime.tick(50);

      const code = 'code';
      _.fakeReadline.getLastQuestion()!.answer(code);

      const oauthContent = _.fakeFs.getFile(path.join(ROOT_DIR, TMP_DIR_NAME, OAUTH_FILE))!.content;
      assert(oauthContent).to.equal(JSON.stringify(tokens));
    });
  });
});

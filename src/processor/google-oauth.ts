import { Credentials, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { cache } from 'gs-tools/export/data';
import { assertNonNull } from 'gs-tools/export/rxjs';
import * as path from 'path';
import * as process from 'process';
import * as readline from 'readline';
import { BehaviorSubject, from as observableFrom, Observable, of as observableOf, ReplaySubject, SchedulerLike, Subject } from 'rxjs';
import { bufferTime, catchError, filter, map, mapTo, skipUntil, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import { getProjectTmpDir } from '../project/get-project-tmp-dir';
import { readFile } from '../util/read-file';
import { writeFile } from '../util/write-file';


const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';
const SCOPE_CHANGE_DEBOUNCE_MS = 50;
export const OAUTH_FILE = 'google_oauth.json';

const LOGGER = new Logger('@hive/processor/google-oauth');
const LOGGER_AUTH_URL = new Logger('authurl');

export interface GoogleAuth {
  client: OAuth2Client;
  scopes: ReadonlySet<string>;
}

type OauthClientFactory = (clientId: string, clientSecret: string) => OAuth2Client;
const DEFAULT_OAUTH_FACTORY = (clientId: string, clientSecret: string) =>
    new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

export interface CredentialsFile extends Credentials {
  scope: string;
}

export class GoogleOauth {
  private readonly addedScopes$ = new BehaviorSubject<ReadonlySet<string>>(new Set());
  private readonly oauth2Client: OAuth2Client;
  private readonly onInitialized$ = new ReplaySubject<void>(1);
  private readonly onScopeAdded$ = new Subject<string>();
  private readonly onUpdateTmpDir$ = new Subject<Credentials>();

  constructor(
      clientId: string,
      clientSecret: string,
      createOauth2Client: OauthClientFactory = DEFAULT_OAUTH_FACTORY,
      private readonly scheduler?: SchedulerLike,
  ) {
    this.oauth2Client = createOauth2Client(clientId, clientSecret);
    this.initializeAddedScopes();
    this.setupOnScopeChange();
    this.setupOnUpdateTmpDir();
  }

  addScope(scope: string): void {
    this.onScopeAdded$.next(scope);
  }

  @cache()
  get auth(): Observable<GoogleAuth> {
    return this.addedScopes$.pipe(
        map(scopes => ({client: this.oauth2Client, scopes})),
    );
  }

  private initializeAddedScopes(): void {
    getProjectTmpDir()
        .pipe(
            switchMap(tmpDir => {
              if (!tmpDir) {
                return observableOf(null);
              }

              return readFile(path.join(tmpDir, OAUTH_FILE)).pipe(
                  catchError(() => observableOf(null)),
              );
            }),
        )
        .subscribe(oauthContent => {
          if (oauthContent) {
            const credentials: CredentialsFile = JSON.parse(oauthContent);
            this.oauth2Client.setCredentials(credentials);
            this.addedScopes$.next(new Set(credentials.scope.split(' ')));
          }

          this.onInitialized$.next();
        });
  }

  private setupOnScopeChange(): void {
    this.onScopeAdded$.pipe(
        bufferTime(SCOPE_CHANGE_DEBOUNCE_MS, this.scheduler),
        skipUntil(this.onInitialized$),
        withLatestFrom(this.addedScopes$),
        map(([newScopes, addedScopes]) => {
          const scopeToAdd = new Set<string>();
          for (const newScope of newScopes) {
            if (!addedScopes.has(newScope)) {
              scopeToAdd.add(newScope);
            }
          }
          return scopeToAdd;
        }),
        filter(toAdd => toAdd.size > 0),
        switchMap(newScopes => {
          const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [...newScopes],
          });

          LOGGER.info(`Please visit:`);
          LOGGER_AUTH_URL.info(`\n`);
          LOGGER_AUTH_URL.info(`\n`);
          LOGGER_AUTH_URL.info(authUrl);
          LOGGER_AUTH_URL.info(`\n`);
          LOGGER_AUTH_URL.info(`\n`);
          LOGGER.info(`and paste the auth code below:`);

          const readlineInterface = readline.createInterface({
            input: process.stdin,
          });

          return new Observable<string>(subscriber => {
            readlineInterface.question('', code => {
              subscriber.next(code);
              subscriber.complete();
            });
          })
          .pipe(
              switchMap(code => observableFrom(this.oauth2Client.getToken(code))),
              map(response => response.tokens),
              tap(tokens => {
                this.onUpdateTmpDir$.next(tokens);
                this.oauth2Client.setCredentials(tokens);
              }),
              mapTo(newScopes),
          );
        }),
        withLatestFrom(this.addedScopes$),
    )
    .subscribe(([newScopes, addedScopes]) => {
      this.addedScopes$.next(new Set([...newScopes, ...addedScopes]));
    });
  }

  private setupOnUpdateTmpDir(): void {
    this.onUpdateTmpDir$
        .pipe(
            switchMap(tokens => {
              return getProjectTmpDir().pipe(
                  assertNonNull('Root project cannot be found'),
                  switchMap(tmpDir => {
                    return writeFile(path.join(tmpDir, OAUTH_FILE), JSON.stringify(tokens));
                  }),
                  take(1),
              );
            }),
        )
        .subscribe();
  }
}

export type GoogleOauthFactory = (clientId: string, clientSecret: string) => GoogleOauth;
export const DEFAULT_GOOGLE_OAUTH_FACTORY: GoogleOauthFactory =
    (clientId, clientSecret) => new GoogleOauth(clientId, clientSecret);

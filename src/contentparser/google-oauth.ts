import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as process from 'process';
import * as readline from 'readline';

import { cache } from '@gs-tools/data';
import { BehaviorSubject, from as observableFrom, Observable, SchedulerLike, Subject } from '@rxjs';
import { bufferTime, filter, map, mapTo, switchMap, tap, withLatestFrom } from '@rxjs/operators';

import { LOGGER } from '../cli/logger';


const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';
const SCOPE_CHANGE_DEBOUNCE_MS = 50;

export interface GoogleAuth {
  client: OAuth2Client;
  scopes: ReadonlySet<string>;
}

type OauthClientFactory = (clientId: string, clientSecret: string) => OAuth2Client;
const DEFAULT_OAUTH_FACTORY = (clientId: string, clientSecret: string) =>
    new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

export class GoogleOauth {
  private readonly addedScopes$ = new BehaviorSubject<ReadonlySet<string>>(new Set());
  private readonly oauth2Client: OAuth2Client;
  private readonly onScopeAdded$ = new Subject<string>();

  constructor(
      clientId: string,
      clientSecret: string,
      createOauth2Client: OauthClientFactory = DEFAULT_OAUTH_FACTORY,
      private readonly scheduler?: SchedulerLike,
  ) {
    this.oauth2Client = createOauth2Client(clientId, clientSecret);
    this.setupOnScopeChange();
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

  private setupOnScopeChange(): void {
    this.onScopeAdded$.pipe(
        bufferTime(SCOPE_CHANGE_DEBOUNCE_MS, this.scheduler),
        filter(newScopes => newScopes.length > 0),
        switchMap(newScopes => {
          const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: newScopes,
          });

          LOGGER.info('', `Please visit:\n\n${authUrl}\n\nand paste the auth code below:`);

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
              // TODO: Cache the token.
              // switchMap(response => {
              //   return writeFile('oauthtoken', JSON.stringify(response.tokens)).pipe(mapTo(response.tokens));
              // }),
              tap(tokens => this.oauth2Client.setCredentials(tokens)),
              mapTo(newScopes),
          );
        }),
        withLatestFrom(this.addedScopes$),
    )
    .subscribe(([newScopes, addedScopes]) => {
      this.addedScopes$.next(new Set([...newScopes, ...addedScopes]));
    });
  }
}

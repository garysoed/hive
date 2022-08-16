import * as glob from 'glob';
import {fake, spy} from 'gs-testing';
import {EMPTY, Observable} from 'rxjs';

import {globWrapper} from '../util/glob-wrapper';

const HANDLERS = new Map<string, Observable<string[]>>();

export function addGlobHandler(pattern: string, cwd: string, obs: Observable<string[]>): void {
  HANDLERS.set(`${cwd}_${pattern}`, obs);
}

export function mockGlob(): void {
  HANDLERS.clear();

  fake(spy(globWrapper, 'glob')).always().call((pattern: string, {cwd}: glob.IOptions) => {
    const obs = HANDLERS.get(`${cwd}_${pattern}`);
    if (!obs) {
      return EMPTY;
    }

    return obs;
  });
}

import * as path from 'path';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from 'santa';

import { parseConfig } from '../config/parse-config';
import { Rule } from '../core/rule';
import { RuleRef } from '../core/rule-ref';

import { readFile } from './read-file';
import { readRules } from './read-rules';
import { resolveFileRef } from './resolve-file-ref';


export const RULE_FILE_NAME = 'hive.js';
const LOGGER = new Logger('@hive/util/read-rule');

export interface RuleWithPath {
  readonly path: string;
  readonly rule: Rule;
}

export function readRule(ref: RuleRef, cwd: string): Observable<RuleWithPath> {
  return readRules(ref, cwd).pipe(
      map(({rules, path}) => {
        if (rules.length !== 1) {
          throw new Error('Multiple rules are not supported');
        }

        return {path, rule: rules[0]};
      }),
  );
}

import {Vine} from 'grapevine';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Rule} from '../core/rule';
import {RuleRef} from '../core/rule-ref';

import {readRules} from './read-rules';


export const RULE_FILE_NAME = 'hive.js';

export interface RuleWithPath {
  readonly path: string;
  readonly rule: Rule;
}

export function readRule(vine: Vine, ref: RuleRef, cwd: string): Observable<RuleWithPath> {
  return readRules(vine, ref, cwd).pipe(
      map(({rules, path}) => {
        if (rules.length !== 1) {
          throw new Error('Multiple rules are not supported');
        }

        return {path, rule: rules[0]};
      }),
  );
}

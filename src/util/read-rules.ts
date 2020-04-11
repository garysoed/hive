import * as path from 'path';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from 'santa';

import { parseConfig } from '../config/parse-config';
import { Rule } from '../core/rule';
import { RuleRef } from '../core/rule-ref';

import { readFile } from './read-file';
import { resolveFileRef } from './resolve-file-ref';


export const RULE_FILE_NAME = 'hive.js';
const LOGGER = new Logger('@hive/util/read-rule');

export interface RulesWithPath {
  readonly path: string;
  readonly rules: readonly Rule[];
}

export function readRules(ref: RuleRef, cwd: string): Observable<RulesWithPath> {
  return resolveFileRef(ref, cwd).pipe(
      switchMap(resolvedFileRef => {
        LOGGER.progress(`Reading: ${resolvedFileRef}:${ref.ruleName}`);
        return readFile(path.join(resolvedFileRef, RULE_FILE_NAME)).pipe(
            map(fileContent => parseConfig(fileContent)),
            map(config => {
              if (ref.ruleName === '*') {
                return [...config.values()];
              }

              const rule = config.get(ref.ruleName);
              if (!rule) {
                return [];
              }

              return [rule];
            }),
            map(rules => {
              if (rules.length <= 0) {
                throw new Error(`Cannot find rules ${ref.ruleName} from ${resolvedFileRef}`);
              }

              return {rules, path: resolvedFileRef};
            }),
        );
      }),
  );
}

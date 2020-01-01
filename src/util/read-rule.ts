import * as path from 'path';

import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';
import { Logger } from '@santa';

import { parseConfig } from '../config/parse-config';
import { Rule } from '../core/rule';
import { RuleRef } from '../core/rule-ref';

import { readFile } from './read-file';
import { resolveFileRef } from './resolve-file-ref';


export const RULE_FILE_NAME = 'hive.js';
const LOGGER = new Logger('@hive/util/read-rule');

export function readRule(ref: RuleRef): Observable<Rule> {
  return resolveFileRef(ref).pipe(
      switchMap(resolvedFileRef => {
        LOGGER.progress(`Reading: ${resolvedFileRef}:${ref.ruleName}`);
        return readFile(path.join(resolvedFileRef, RULE_FILE_NAME)).pipe(
            map(fileContent => parseConfig(fileContent)),
            map(config => config.get(ref.ruleName)),
            map(rule => {
              if (!rule) {
                throw new Error(`Cannot find rule ${rule} from ${resolveFileRef}`);
              }

              return rule;
            }),
        );
      }),
  );
}

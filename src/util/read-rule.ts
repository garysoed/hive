import { Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { parseConfig } from '../config/parse-config';
import { Rule } from '../core/rule';
import { RuleRef } from '../core/rule-ref';

import { readFile } from './read-file';
import { resolveFileRef } from './resolve-file-ref';


export function readRule(ref: RuleRef): Observable<Rule> {
  return resolveFileRef(ref).pipe(
      switchMap(resolvedFileRef => {
        return readFile(resolvedFileRef).pipe(
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

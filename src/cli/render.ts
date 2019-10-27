import * as commandLineArgs from 'command-line-args';

import { Observable, throwError } from '@rxjs';
import { mapTo, switchMap } from '@rxjs/operators';

import { parseRuleRef } from '../config/parse-rule-ref';
import { RuleType } from '../core/rule-type';
import { readRule } from '../util/read-rule';
import { runRule } from '../util/run-rule';

import { CommandType } from './command-type';


const RULE_OPTION = 'rule';
const OPTIONS = [
  {
    name: RULE_OPTION,
    defaultOption: true,
  },
];

export const CLI = {
  title: 'Hive: Render',
  body: () => ({
    header: 'COMMANDS',
    content: [
      {name: CommandType.RENDER, summary: CLI.summary},
    ],
  }),
  summary: 'Renders the given render rule',
  synopsis: `$ hive ${CommandType.RENDER} <path_to_render_rule>`,
};

export function render(argv: string[]): Observable<string> {
  const options = commandLineArgs(OPTIONS, {argv, stopAtFirstUnknown: true});
  const rulePath = options[RULE_OPTION];
  if (typeof rulePath !== 'string') {
    return throwError(new Error(`Path ${rulePath} is invalid`));
  }

  const ruleRef = parseRuleRef(rulePath);

  return readRule(ruleRef).pipe(
      switchMap(rule => {
        if (rule.type !== RuleType.RENDER) {
          throw new Error(`Rule ${rulePath} is not a RENDER rule`);
        }
        return runRule(rule);
      }),
      mapTo('done'),
  );
}

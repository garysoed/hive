import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import {EMPTY, merge, Observable, throwError} from 'rxjs';
import {mapTo, switchMap} from 'rxjs/operators';

import {parseRuleRef} from '../config/parse/parse-rule-ref';
import {RuleType} from '../core/rule-type';
import {readRules} from '../util/read-rules';
import {runRule} from '../util/run-rule';

import {CommandType} from './command-type';


const RULE_OPTION = 'rule';
const OPTIONS = [
  {
    name: RULE_OPTION,
    defaultOption: true,
  },
];

export const CLI = {
  title: 'Hive: Render',
  body: (): readonly commandLineUsage.Section[] => ([
    {
      header: 'OPTIONS',
      content: [
        {
          name: 'path_to_render_rule',
          description: 'Path to the rule to be rendered. E.g.: @out/path/to:render_rule',
        },
      ],
    },
  ]),
  summary: 'Renders the given render rule',
  synopsis: `$ {bold hive} {underline ${CommandType.RENDER}} <path_to_render_rule>`,
};

export function render(argv: string[]): Observable<string> {
  const options = commandLineArgs.default(OPTIONS, {argv, stopAtFirstUnknown: true});
  const rulePath = options[RULE_OPTION];
  if (typeof rulePath !== 'string') {
    return throwError(new Error(`Path ${rulePath} is invalid`));
  }

  const ruleRef = parseRuleRef(rulePath);
  const cwd = process.cwd();

  return readRules(ruleRef, cwd).pipe(
      switchMap(({rules, path}) => {
        const obsList = rules.map(rule => {
          if (rule.type !== RuleType.RENDER) {
            return EMPTY;
          }
          return runRule(rule, path);
        });

        return merge(...obsList);
      }),
      mapTo('done'),
  );
}

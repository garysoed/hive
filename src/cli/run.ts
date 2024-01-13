import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import {Vine} from 'grapevine';
import {EMPTY, merge, Observable, throwError} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';

import {parseRuleRef} from '../config/parse/parse-rule-ref';
import {RuleType} from '../core/rule-type';
import {readRules} from '../util/read-rules';
import {runRule} from '../util/run-rule';

import {CommandType} from './command-type';

const ONCE_OPTION = 'once';
const RULE_OPTION = 'rule';
const OPTIONS = [
  {
    name: RULE_OPTION,
    defaultOption: true,
  },
  {name: ONCE_OPTION, alias: 'o', type: Boolean},
];

export const CLI = {
  title: 'Hive: Run',
  body: (): readonly commandLineUsage.Section[] => ([
    {
      header: 'OPTIONS',
      content: [
        {
          name: 'path_to_rule',
          description: 'Path to the rule to be rendered. E.g.: @out/path/to:rule',
        },
        {
          name: 'once',
          description: 'Only run the command once',
        },
      ],
    },
  ]),
  summary: 'Renders the given render rule',
  synopsis: `$ {bold hive} {underline ${CommandType.RUN}} <path_to_rule> [--once]`,
};

export function run(vine: Vine, argv: string[]): Observable<string> {
  const options = commandLineArgs(OPTIONS, {argv, stopAtFirstUnknown: true});
  const rulePath = options[RULE_OPTION];
  const once = options[ONCE_OPTION] ?? false;
  if (typeof rulePath !== 'string') {
    return throwError(() => new Error(`Path ${rulePath} is invalid`));
  }

  const ruleRef = parseRuleRef(rulePath);
  const cwd = process.cwd();

  const obs = readRules(vine, ruleRef, cwd).pipe(
      switchMap(({rules, path}) => {
        const obsList = rules.map(rule => {
          if (rule.type !== RuleType.RENDER) {
            return EMPTY;
          }
          return runRule(vine, rule, path);
        });

        return merge(...obsList);
      }),
      map(() => 'done'),
  );

  if (!once) {
    return obs;
  }

  return obs.pipe(take(1));
}

import commandLineArgs from 'command-line-args';

import { $, $map } from '@gs-tools/collect';
import { Observable, throwError } from '@rxjs';
import { map, mapTo, switchMap, take, tap } from '@rxjs/operators';
import { Logger } from '@santa';

import { parseRuleRef } from '../config/parse/parse-rule-ref';
import { RuleType } from '../core/rule-type';
import { findRoot } from '../project/find-root';
import { loadProjectConfig } from '../project/load-project-config';
import { readRule } from '../util/read-rule';
import { runRule } from '../util/run-rule';

import { CommandType } from './command-type';


const LOGGER = new Logger('@hive/cli/analyze');


const ALL_OPTIONS = 'all';
const OPTIONS = [
  {
    name: ALL_OPTIONS,
    defaultOption: true,
    multiple: true,
  },
];

export const CLI = {
  title: 'Hive: Analyze',
  body: () => ({
  }),
  summary: 'Analyzes a rule or a project',
  synopsis: `$ hive ${CommandType.ANALYZE} <type> [<path_to_rule>]`,
};

export function analyze(argv: string[]): Observable<unknown> {
  const options = commandLineArgs(OPTIONS, {argv, stopAtFirstUnknown: true});
  const [type, rulePath] = options[ALL_OPTIONS];
  switch (type) {
    case 'project':
      return analyzeProject();
  }


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

function analyzeProject(): Observable<unknown> {
  return findRoot().pipe(
      take(1),
      switchMap(root => {
        if (!root) {
          return throwError(new Error('No project roots found'));
        }

        return loadProjectConfig().pipe(map(config => ({root, config})));
      }),
      map(({root, config}) => {
        const roots = $(
            config.roots,
            $map(([key, value]) => `-   @${key} -> ${value}`),
        );
        const globals = $(
            config.globals,
            $map(([key, value]) => `-   ${key}: ${value}`),
        );
        return [
          `Root: ${root}`,
          `@out -> ${config.outdir}`,
          `Root directories:`,
          ...roots,
          'Globals:',
          ...globals,
          '',
        ].join('\n');
      }),
      tap(message => LOGGER.info(message)),
  );
}

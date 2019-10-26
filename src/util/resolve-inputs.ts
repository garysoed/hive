import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { RenderInput } from '../core/render-input';
import { isRuleRef } from '../core/rule-ref';
import { RuleType } from '../core/rule-type';

import { readRule } from './read-rule';
import { RunRuleFn } from './run-rule-fn';


export function resolveInputs(
    inputs: ReadonlyMap<string, RenderInput>,
    resolveRuleFn: RunRuleFn,
): Observable<ReadonlyMap<string, unknown>> {
  const entries: Array<Observable<[string, unknown]>> = [];
  for (const [key, value] of inputs) {
    if (!isRuleRef(value)) {
      entries.push(observableOf([key, value]));
      continue;
    }

    const value$: Observable<[string, unknown]> = readRule(value).pipe(
        switchMap(rule => {
          switch (rule.type) {
            case RuleType.DECLARE:
              return resolveRuleFn(rule);
            case RuleType.LOAD:
              return resolveRuleFn(rule);
            case RuleType.RENDER:
              return resolveRuleFn(rule).pipe(
                  map(resultsMap => [...resultsMap.values()]),
              );
          }
        }),
        map(ruleValue => ([key, ruleValue])),
    );
    entries.push(value$);
  }

  return combineLatest(entries).pipe(map(entries => new Map(entries)));
}

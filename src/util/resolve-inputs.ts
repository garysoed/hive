import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { RenderInput } from '../core/render-input';
import { Rule } from '../core/rule';
import { isRuleRef } from '../core/rule-ref';

import { readRule } from './read-rule';


export function resolveInputs(
    inputs: ReadonlyMap<string, RenderInput>,
    resolveRuleFn: (rule: Rule) => Observable<unknown>,
): Observable<ReadonlyMap<string, unknown>> {
  const entries: Array<Observable<[string, unknown]>> = [];
  for (const [key, value] of inputs) {
    if (!isRuleRef(value)) {
      entries.push(observableOf([key, value]));
      continue;
    }

    const value$: Observable<[string, unknown]> = readRule(value).pipe(
        switchMap(rule => resolveRuleFn(rule)),
        map(ruleValue => ([key, ruleValue])),
    );
    entries.push(value$);
  }

  return combineLatest(entries).pipe(map(entries => new Map(entries)));
}

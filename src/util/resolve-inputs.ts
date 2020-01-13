import { ArrayOfType } from '@gs-types';
import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { ArrayLoader } from '../config/array-loader';
import { parseContent } from '../contentparser/parse-content';
import { RenderInput, ResolvedRenderInput } from '../core/render-input';
import { isRuleRef } from '../core/rule-ref';
import { RuleType } from '../core/rule-type';

import { readRule } from './read-rule';
import { RunRuleFn } from './run-rule-fn';


export function resolveInputs(
    inputs: ReadonlyMap<string, RenderInput>,
    resolveRuleFn: RunRuleFn,
): Observable<ReadonlyMap<string, ResolvedRenderInput>> {
  const entries: Array<Observable<[string, ResolvedRenderInput]>> = [];
  for (const [key, value] of inputs) {
    if (!isRuleRef(value)) {
      entries.push(observableOf([key, value]));
      continue;
    }

    const value$: Observable<[string, ResolvedRenderInput]> = readRule(value).pipe(
        switchMap(rule => {
          switch (rule.type) {
            case RuleType.DECLARE:
              return resolveRuleFn(rule);
            case RuleType.LOAD:
              return resolveRuleFn(rule).pipe(
                  map(content => {
                    if (rule.output instanceof ArrayLoader) {
                      const itemLoader = rule.output.itemLoader;
                      const entries = content.map(entry => itemLoader.load(entry));
                      if (entries.length <= 0) {
                        return [];
                      }

                      return entries;
                    }

                    if (content.length !== 1) {
                      throw new Error(`Rule ${rule.name} has non array output but multiple inputs`);
                    }

                    return rule.output.load(content[0]);
                  }),
              );
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

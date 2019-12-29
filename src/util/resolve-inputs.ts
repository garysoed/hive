import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { parseContent } from '../contentparser/parse-content';
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
              return resolveRuleFn(rule).pipe(
                  switchMap(content => {
                    if (rule.output.isArray) {
                      const typePerFile = {...rule.output, isArray: false};
                      const entries = content.map(entry => parseContent(entry, typePerFile));
                      if (entries.length <= 0) {
                        return observableOf([]);
                      }

                      return combineLatest(entries);
                    }

                    if (content.length !== 1) {
                      throw new Error(`Rule ${rule.name} has non array output but multiple inputs`);
                    }

                    return parseContent(content[0], rule.output);
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

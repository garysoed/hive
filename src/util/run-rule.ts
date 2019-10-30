import { Observable } from '@rxjs';

import { DeclareRule } from '../core/declare-rule';
import { LoadRule } from '../core/load-rule';
import { RenderRule } from '../core/render-rule';
import { Rule } from '../core/rule';
import { RuleType } from '../core/rule-type';

import { DeclareFn, runDeclare } from './run-declare';
import { runLoad } from './run-load';
import { runRender } from './run-render';
import { RunRuleFn } from './run-rule-fn';


export function runRule(renderRule: RenderRule): Observable<ReadonlyMap<string, unknown>>;
export function runRule(declareRule: DeclareRule): Observable<DeclareFn>;
export function runRule(loadRule: LoadRule): Observable<string|string[]>;
export function runRule(rule: Rule): Observable<unknown> {
  switch (rule.type) {
    case RuleType.DECLARE:
      return runDeclare(rule);
    case RuleType.LOAD:
      return runLoad(rule);
    case RuleType.RENDER:
      return runRender(rule, runRule as RunRuleFn);
  }
}

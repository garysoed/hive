import {Observable} from 'rxjs';

import {DeclareRule} from '../core/declare-rule';
import {LoadRule} from '../core/load-rule';
import {Processor} from '../core/processor';
import {RenderRule} from '../core/render-rule';
import {Rule} from '../core/rule';
import {RuleType} from '../core/rule-type';

import {runDeclare} from './run-declare';
import {runLoad} from './run-load';
import {runRender} from './run-render';
import {RunRuleFn} from './run-rule-fn';


export function runRule(
    renderRule: RenderRule,
    cwd: string,
): Observable<ReadonlyMap<string, unknown>>;
export function runRule(declareRule: DeclareRule, cwd: string): Observable<Processor>;
export function runRule(loadRule: LoadRule, cwd: string): Observable<string|string[]>;
export function runRule(rule: Rule, cwd: string): Observable<unknown> {
  switch (rule.type) {
    case RuleType.DECLARE:
      return runDeclare(rule, cwd);
    case RuleType.LOAD:
      return runLoad(rule, cwd);
    case RuleType.RENDER:
      return runRender(rule, runRule as RunRuleFn, cwd);
  }
}

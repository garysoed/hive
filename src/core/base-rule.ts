import { RuleType } from './rule-type';

export interface BaseRule {
  readonly name: string;
  readonly type: RuleType;
}

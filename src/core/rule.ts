import { RuleType } from './rule-type';

export interface Rule {
  readonly name: string;
  readonly type: RuleType;
}

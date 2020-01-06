import { BaseRule } from './base-rule';
import { FileRef } from './file-ref';
import { RuleType } from './rule-type';
import { InputType } from './type/input-type';

export interface DeclareRule extends BaseRule {
  readonly inputs: ReadonlyMap<string, InputType>;
  readonly processor: FileRef;
  readonly type: RuleType.DECLARE;
}

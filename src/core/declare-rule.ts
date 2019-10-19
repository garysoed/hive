import { BaseRule } from './base-rule';
import { FileRef } from './file-ref';
import { RuleType } from './rule-type';
import { InputType } from './type/input-type';
import { OutputType } from './type/output-type';

export interface DeclareRule extends BaseRule {
  readonly inputs: ReadonlyMap<string, InputType>;
  readonly output: OutputType;
  readonly processor: FileRef;
  readonly type: RuleType.DECLARE;
}

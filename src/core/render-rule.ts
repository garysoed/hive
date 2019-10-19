import { BaseRule } from './base-rule';
import { FilePattern } from './file-pattern';
import { RenderInput } from './render-input';
import { RuleRef } from './rule-ref';
import { RuleType } from './rule-type';

export interface RenderRule extends BaseRule {
  readonly inputs: ReadonlyMap<string, RenderInput>;
  readonly output: FilePattern;
  readonly processor: RuleRef;
  readonly type: RuleType.RENDER;
}

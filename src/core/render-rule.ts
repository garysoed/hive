import { FilePattern } from './file-pattern';
import { RenderInput } from './render-input';
import { Rule } from './rule';
import { RuleRef } from './rule-ref';

export interface RenderRule extends Rule {
  readonly inputs: {readonly [key: string]: RenderInput};
  readonly output: FilePattern;
  readonly processor: RuleRef;
}

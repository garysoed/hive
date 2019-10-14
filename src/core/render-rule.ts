import { FilePattern } from './file-pattern';
import { Rule } from './rule';
import { RuleRef } from './rule-ref';
import { Type } from './type/type';

export interface RenderRule extends Rule {
  inputs: {[key: string]: Type};
  output: FilePattern;
  processor: RuleRef;
}

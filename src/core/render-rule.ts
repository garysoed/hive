import { DeclarationRule } from './declaration-rule';
import { FileRefPattern } from './file-ref-pattern';
import { Rule } from './rule';
import { RuleRef } from './rule-ref';
import { Type } from './type';

export interface RenderRule extends Rule {
  inputs: {[key: string]: Type};
  output: FileRefPattern;
  processor: RuleRef<DeclarationRule>;
}

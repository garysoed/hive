import { FileRef } from './file-ref';
import { Rule } from './rule';
import { Type } from './types/type';

export interface DeclarationRule extends Rule {
  inputs: {[key: string]: Type};
  output: Type;
  processor: FileRef;
}

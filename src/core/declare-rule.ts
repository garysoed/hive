import { FileRef } from './file-ref';
import { Rule } from './rule';
import { Type } from './type/type';

export interface DeclareRule extends Rule {
  inputs: {[key: string]: Type};
  output: Type;
  processor: FileRef;
}

import { FileRef } from './file-ref';
import { Rule } from './rule';
import { Type } from './type/type';

export interface DeclareRule extends Rule {
  readonly inputs: {readonly [key: string]: Type};
  readonly output: Type;
  readonly processor: FileRef;
}

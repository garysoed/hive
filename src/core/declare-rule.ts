import { FileRef } from './file-ref';
import { Rule } from './rule';
import { InputType } from './type/input-type';
import { Type } from './type/type';

export interface DeclareRule extends Rule {
  readonly inputs: {readonly [key: string]: InputType};
  readonly output: Type;
  readonly processor: FileRef;
}

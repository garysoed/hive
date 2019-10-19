import { FileRef } from './file-ref';
import { Rule } from './rule';
import { InputType } from './type/input-type';
import { OutputType } from './type/output-type';

export interface DeclareRule extends Rule {
  readonly inputs: ReadonlyMap<string, InputType>;
  readonly output: OutputType;
  readonly processor: FileRef;
}

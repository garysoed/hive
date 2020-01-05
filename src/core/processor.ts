import { InputType } from './type/input-type';
import { OutputType } from './type/output-type';

export interface Processor {
  readonly inputs: ReadonlyMap<string, InputType>;
  readonly output: OutputType;

  fn(inputs: ReadonlyMap<string, any>): unknown;
}

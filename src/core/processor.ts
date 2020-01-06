import { InputType } from './type/input-type';

export interface Processor {
  readonly inputs: ReadonlyMap<string, InputType>;

  fn(inputs: ReadonlyMap<string, any>): unknown;
}

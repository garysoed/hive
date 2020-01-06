import { Type } from '@gs-types';

export interface Processor {
  readonly inputs: ReadonlyMap<string, Type<unknown>>;

  fn(inputs: ReadonlyMap<string, any>): unknown;
}

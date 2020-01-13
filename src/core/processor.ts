import { Type } from '@gs-types';

import { Serializer } from '../config/serializer/serializer';

export interface Processor {
  readonly inputs: ReadonlyMap<string, Type<unknown>>;
  readonly output: Serializer<unknown>;

  fn(inputs: ReadonlyMap<string, unknown>): unknown;
}

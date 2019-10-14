import { HasPropertiesType, InstanceofType } from '@gs-types';

import { AcceptanceLevel } from './acceptance-level';

export interface Type {
  accepts(otherType: Type): AcceptanceLevel;

  stringify(): string;
}

const TYPE_TYPE = HasPropertiesType<Type>({
  accepts: InstanceofType<(other: Type) => AcceptanceLevel>(Function),
  stringify: InstanceofType<() => string>(Function),
});

export function isType(obj: unknown): obj is Type {
  return TYPE_TYPE.check(obj);
}

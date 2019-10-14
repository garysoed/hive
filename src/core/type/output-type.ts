import { BooleanType, HasPropertiesType, InstanceofType, Type } from '@gs-types';

import { MediaTypeType } from './media-type-type';


export type BaseType =
    Type<boolean>|Type<number>|Type<string>|Type<Object>|Type<Function>|MediaTypeType;

export interface OutputType {
  readonly baseType: BaseType;
  readonly isArray: boolean;
}

const OUTPUT_TYPE_TYPE = HasPropertiesType<OutputType>({
  baseType: HasPropertiesType<Type<any>>({
    check: InstanceofType<(target: any) => target is any>(Function),
    toString: InstanceofType<() => string>(Function),
  }),
  isArray: BooleanType,
});

export function isOutputType(target: unknown): target is OutputType {
  return OUTPUT_TYPE_TYPE.check(target);
}

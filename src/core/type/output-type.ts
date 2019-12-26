import { BooleanType, EnumType, HasPropertiesType, InstanceofType, UnionType } from '@gs-types';

import { ConstType } from './const-type';
import { MediaTypeType } from './media-type-type';


export type BaseType = ConstType|MediaTypeType;

export interface OutputType {
  readonly baseType: BaseType;
  readonly isArray: boolean;
}

const OUTPUT_TYPE_TYPE = HasPropertiesType<OutputType>({
  baseType: UnionType([
    EnumType(ConstType),
    InstanceofType(MediaTypeType),
  ]),
  isArray: BooleanType,
});

export function isOutputType(target: unknown): target is OutputType {
  return OUTPUT_TYPE_TYPE.check(target);
}

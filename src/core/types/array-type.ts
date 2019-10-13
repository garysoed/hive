import { AcceptanceLevel } from './acceptance-level';
import { BOOLEAN_TYPE, NUMBER_TYPE, OBJECT_TYPE, STRING_TYPE } from './const-type';
import { Type } from './type';

function createArrayType(elementType: Type): Type {
  const instance = {
    accepts(other: Type): AcceptanceLevel {
      switch (other) {
        case instance:
          return AcceptanceLevel.ACCEPTABLE;
        case elementType:
          return AcceptanceLevel.ACCEPTABLE_AS_ELEMENT;
        default:
          return AcceptanceLevel.UNACCEPTABLE;
      }
    },
  };
  return instance;
}

export const BOOLEAN_ARRAY_TYPE = createArrayType(BOOLEAN_TYPE);
export const NUMBER_ARRAY_TYPE = createArrayType(NUMBER_TYPE);
export const STRING_ARRAY_TYPE = createArrayType(STRING_TYPE);
export const OBJECT_ARRAY_TYPE = createArrayType(OBJECT_TYPE);


import { AcceptanceLevel } from './acceptance-level';
import { Type } from './type';

function createBaseConstType(asString: string): Type {
  const instance = {
    accepts: (otherType: Type): AcceptanceLevel => {
      return otherType === instance ? AcceptanceLevel.ACCEPTABLE : AcceptanceLevel.UNACCEPTABLE;
    },

    stringify: (): string => {
      return asString;
    },
  };

  return instance;
}

export const BOOLEAN_TYPE = createBaseConstType('boolean');
export const NUMBER_TYPE = createBaseConstType('number');
export const STRING_TYPE = createBaseConstType('string');
export const OBJECT_TYPE = createBaseConstType('object');

import { AcceptanceLevel } from './acceptance-level';
import { Type } from './type';

function createBaseConstType(): Type {
  const instance = {
    accepts: (otherType: Type): AcceptanceLevel => {
      return otherType === instance ? AcceptanceLevel.ACCEPTABLE : AcceptanceLevel.UNACCEPTABLE;
    },
  };

  return instance;
}

export const BOOLEAN_TYPE = createBaseConstType();
export const NUMBER_TYPE = createBaseConstType();
export const STRING_TYPE = createBaseConstType();
export const OBJECT_TYPE = createBaseConstType();

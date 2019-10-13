import { AcceptanceLevel } from './acceptance-level';

export interface Type {
  accepts(otherType: Type): AcceptanceLevel;
}

export function isType(obj: unknown): obj is Type {
  if (typeof obj !== 'object') {
    return false;
  }

  if (!obj) {
    return false;
  }

  return obj.hasOwnProperty('isAssignableTo');
}

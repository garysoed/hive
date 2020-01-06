import { Observable, of as observableOf } from '@rxjs';

import { RenderInput } from '../core/render-input';
import { ConstType } from '../core/type/const-type';
import { BaseType, OutputType } from '../core/type/output-type';


export function getTypeOfValue(value: RenderInput): Observable<OutputType|'emptyArray'> {
  if (value instanceof Array) {
    if (value.length <= 0) {
      return observableOf('emptyArray');
    }

    return observableOf({isArray: true, baseType: getBaseType(value[0])});
  }

  return observableOf({isArray: false, baseType: getBaseType(value)});
}

function getBaseType(value: unknown): BaseType {
  switch (typeof value) {
    case 'boolean':
      return ConstType.BOOLEAN;
    case 'number':
      return ConstType.NUMBER;
    case 'string':
      return ConstType.STRING;
    case 'object':
      return ConstType.OBJECT;
    case 'function':
      return ConstType.FUNCTION;
    default:
      throw new Error(`Unsupported value: ${value}`);
  }
}

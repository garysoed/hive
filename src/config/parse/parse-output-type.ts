import { ConstType } from '../../core/type/const-type';
import { MediaTypeType } from '../../core/type/media-type-type';
import { BaseType, OutputType } from '../../core/type/output-type';

export function parseOutputType(untrimmedRaw: string): OutputType {
  if (!untrimmedRaw) {
    throw new Error('Output type is empty');
  }

  const raw = untrimmedRaw.trim();

  // Check for array type.
  if (raw.endsWith('[]')) {
    const baseType = getBaseType(raw.substr(0, raw.length - 2));
    if (!baseType) {
      throw new Error(`Invalid output type: ${raw}`);
    }

    return {baseType, isArray: true};
  }

  const baseType = getBaseType(raw);
  if (!baseType) {
    throw new Error(`Invalid output type: ${raw}`);
  }

  return {baseType, isArray: false};
}


function getBaseType(typeStr: string): BaseType|null {
  switch (typeStr) {
    case 'boolean':
      return ConstType.BOOLEAN;
    case 'number':
      return ConstType.NUMBER;
    case 'string':
      return ConstType.STRING;
    case 'function':
      return ConstType.FUNCTION;
    case 'object':
      return ConstType.OBJECT;
    default:
      // Check for MediaType.
      const [type, subtype] = typeStr.split('/');
      if (!type || !subtype) {
        return null;
      }

      return new MediaTypeType(type, subtype);
  }
}

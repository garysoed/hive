import { ast, cst, Tag } from 'yaml';

import { ConstType } from '../core/type/const-type';
import { MediaTypeType } from '../core/type/media-type-type';
import { BaseType, isOutputType, OutputType } from '../core/type/output-type';

import { castAsTag } from './cast-as-tag';


export const OUTPUT_TYPE_TAG: Tag = castAsTag({
  tag: 'tag:yaml.org,2002:hive/o_type',

  identify: (obj: unknown): boolean => {
    return isOutputType(obj);
  },

  resolve: (_doc: ast.Document, cstNode: cst.Node): OutputType => {
    if (cstNode.type !== 'PLAIN') {
      throw new Error(`Invalid output type: ${cstNode.rawValue}`);
    }

    const plainNode = cstNode as cst.PlainValue;
    const str = plainNode.strValue;
    if (!str) {
      throw new Error(`Invalid output type: ${str}`);
    }

    // Check for array type.
    if (str.endsWith('[]')) {
      const baseType = getBaseType(str.substr(0, str.length - 2));
      if (!baseType) {
        throw new Error(`Invalid output type: ${str}`);
      }

      return {baseType, isArray: true};
    }

    const baseType = getBaseType(str);
    if (!baseType) {
      throw new Error(`Invalid output type: ${str}`);
    }

    return {baseType, isArray: false};
  },

  stringify: ({value}: {value: OutputType}): string => {
    const baseTypeStr = stringifyBaseType(value.baseType);
    if (!value.isArray) {
      return baseTypeStr;
    }

    return `${baseTypeStr}[]`;
  },
});

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

function stringifyBaseType(baseType: BaseType): string {
  if (baseType instanceof MediaTypeType) {
    return baseType.stringify();
  }

  return baseType;
}

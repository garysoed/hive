import { ast, cst, Tag } from 'yaml';

import { BooleanType, InstanceofType, NumberType, StringType } from '@gs-types';

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

export const FUNCTION_TYPE = InstanceofType(Function);
export const OBJECT_TYPE = InstanceofType(Object);

function getBaseType(typeStr: string): BaseType|null {
  switch (typeStr) {
    case 'boolean':
      return BooleanType;
    case 'number':
      return NumberType;
    case 'string':
      return StringType;
    case 'function':
      return FUNCTION_TYPE;
    case 'object':
      return OBJECT_TYPE;
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

  switch (baseType) {
    case BooleanType:
      return 'boolean';
    case NumberType:
      return 'number';
    case StringType:
      return 'string';
    case FUNCTION_TYPE:
      return 'function';
    case OBJECT_TYPE:
      return 'object';
    default:
      throw new Error(`Unrecognized type: ${baseType}. If using 'function' or 'object', make` +
          ` sure to use the available global type`);
  }
}

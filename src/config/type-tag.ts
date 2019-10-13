import { ast, cst, Tag } from 'yaml';

import { BOOLEAN_ARRAY_TYPE, NUMBER_ARRAY_TYPE, OBJECT_ARRAY_TYPE, STRING_ARRAY_TYPE } from '../core/type/array-type';
import { BOOLEAN_TYPE, NUMBER_TYPE, OBJECT_TYPE, STRING_TYPE } from '../core/type/const-type';
import { isType, Type } from '../core/type/type';

import { castAsTag } from './cast-as-tag';

export const TYPE_TAG: Tag = castAsTag({
  tag: 'tag:yaml.org,2002:hive/type',

  identify: (obj: unknown): boolean => {
    return isType(obj);
  },

  resolve: (_doc: ast.Document, cstNode: cst.Node): Type => {
    switch (cstNode.rawValue) {
      case 'boolean':
        return BOOLEAN_TYPE;
      case 'number':
        return NUMBER_TYPE;
      case 'string':
        return STRING_TYPE;
      case 'object':
        return OBJECT_TYPE;
      case 'boolean[]':
        return BOOLEAN_ARRAY_TYPE;
      case 'number[]':
        return NUMBER_ARRAY_TYPE;
      case 'string[]':
        return STRING_ARRAY_TYPE;
      case 'object[]':
        return OBJECT_ARRAY_TYPE;
      default:
        throw new Error(`Invalid type: ${cstNode.rawValue}`);
    }
  },

  stringify: (item: {value: Type}): string => {
    return item.value.stringify();
  },
});

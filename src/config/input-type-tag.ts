import { ast, cst, Tag } from 'yaml';

import { InputType, isInputType } from '../core/type/input-type';

import { castAsTag } from './cast-as-tag';


export const INPUT_TYPE_TAG: Tag = castAsTag({
  tag: 'tag:yaml.org,2002:hive/i_type',

  identify: (obj: unknown): boolean => {
    return isInputType(obj);
  },

  resolve: (_doc: ast.Document, cstNode: cst.Node): InputType => {
    if (cstNode.type !== 'PLAIN') {
      throw new Error(`Invalid input type: ${cstNode.rawValue}`);
    }

    const plainNode = cstNode as cst.PlainValue;
    const str = plainNode.strValue;
    if (!str) {
      throw new Error(`Invalid input type: ${str}`);
    }

    const [pattern, flags] = str.split(':');
    if ((flags || '').endsWith('[]')) {
      return {isArray: true, matcher: new RegExp(pattern, flags.substr(0, flags.length - 2))};
    }

    return {isArray: false, matcher: new RegExp(pattern, flags)};
  },

  stringify: ({value}: {value: InputType}): string => {
    const matcher = value.matcher;
    if (value.isArray) {
      return `${matcher.source}:${matcher.flags}[]`;
    }
    return `${matcher.source}:${matcher.flags}`;
  },
});

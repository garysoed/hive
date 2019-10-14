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

    return {matcher: new RegExp(pattern, flags)};
  },

  stringify: (item: {value: InputType}): string => {
    const matcher = item.value.matcher;
    return `${matcher.source}:${matcher.flags}`;
  },
});

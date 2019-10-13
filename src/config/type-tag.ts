import { ast, cst, Tag } from 'yaml';

import { castAsTag } from './cast-as-tag';

const TAG_NAME = 'tag:yaml.org,2002:hive/type';

export const TYPE_TAG: Tag = castAsTag({
  tag: TAG_NAME,

  identify: (obj: unknown): boolean => {
    return typeof obj === 'string';
  },

  resolve: (doc: ast.Document, cstNode: cst.Node): string => {
    return cstNode.rawValue || '';
  },

  stringify: (item: string): string => {
    return item;
  },
});

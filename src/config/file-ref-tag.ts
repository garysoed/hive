import { ast, cst, Tag } from 'yaml';

import { FileRef, isFileRef } from '../core/file-ref';

import { castAsTag } from './cast-as-tag';
import { parseRootType } from './parse-root-type';

export const FILE_REF_TAG: Tag = castAsTag({
  tag: 'tag:yaml.org,2002:hive/file',

  identify: (obj: unknown): boolean => {
    return isFileRef(obj);
  },

  resolve(_doc: ast.Document, cstNode: cst.Node): FileRef {
    const str = cstNode.rawValue;
    if (!str) {
      throw new Error(`Invalid file ref: ${str}`);
    }

    const [rootStr, path] = str.split(':');
    if (!rootStr || !path) {
      throw new Error(`Invalid file ref: ${str}`);
    }

    const rootType = parseRootType(rootStr);
    if (!rootType) {
      throw new Error(`Invalid file ref: ${str}`);
    }

    return {rootType, path};
  },

  stringify: ({value}: {value: FileRef}): string => {
    return `${value.rootType}:${value.path}`;
  },
});

import { ast, cst, Tag } from 'yaml';

import { FileRef, isFileRef } from '../core/file-ref';

import { castAsTag } from './cast-as-tag';
import { parseFileRef } from './parse-file-ref';


export const FILE_REF_TAG: Tag = castAsTag({
  tag: 'tag:yaml.org,2002:hive/file',

  identify: (obj: unknown): boolean => {
    return isFileRef(obj);
  },

  resolve(_doc: ast.Document, cstNode: cst.Node): FileRef {
    if (cstNode.type !== 'PLAIN') {
      throw new Error(`Invalid type: ${cstNode.rawValue}`);
    }

    const plainNode = cstNode as cst.PlainValue;
    const str = plainNode.strValue;
    if (!str) {
      throw new Error(`Invalid file ref: ${str}`);
    }
    return parseFileRef(str);
  },

  stringify: ({value}: {value: FileRef}): string => {
    return `${value.rootType}:${value.path}`;
  },
});

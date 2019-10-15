import { ast, cst, Tag } from 'yaml';

import { GlobRef, isGlobRef } from '../core/glob-ref';

import { castAsTag } from './cast-as-tag';
import { parseRootType } from './parse-root-type';


export const GLOB_REF_TAG: Tag = castAsTag({
  tag: 'tag:yaml.org,2002:hive/glob',

  identify: (obj: unknown): boolean => {
    return isGlobRef(obj);
  },

  resolve(_doc: ast.Document, cstNode: cst.Node): GlobRef {
    if (cstNode.type !== 'PLAIN') {
      throw new Error(`Invalid type: ${cstNode.rawValue}`);
    }

    const plainNode = cstNode as cst.PlainValue;
    const str = plainNode.strValue;
    if (!str) {
      throw new Error(`Invalid glob ref: ${str}`);
    }
    const [rootStr, globPattern] = str.split(':');

    if (!rootStr || !globPattern) {
      throw new Error(`Invalid glob ref: ${str}`);
    }

    const rootType = parseRootType(rootStr);
    if (!rootType) {
      throw new Error(`Invalid glob ref: ${str}`);
    }

    return {rootType, globPattern};
  },

  stringify: ({value}: {value: GlobRef}): string => {
    return `${value.rootType}:${value.globPattern}`;
  },
});

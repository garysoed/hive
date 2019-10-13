import { ast, cst, Tag } from 'yaml';

import { FilePattern, isFilePattern } from '../core/file-pattern';

import { castAsTag } from './cast-as-tag';
import { parseRootType } from './parse-root-type';

export const FILE_PATTERN_TAG: Tag = castAsTag({
  tag: 'tag:yaml.org,2002:hive/pattern',

  identify: (obj: unknown): boolean => {
    return isFilePattern(obj);
  },

  resolve(_doc: ast.Document, cstNode: cst.Node): FilePattern {
    if (cstNode.type !== 'PLAIN') {
      throw new Error(`Invalid type: ${cstNode.rawValue}`);
    }

    const plainNode = cstNode as cst.PlainValue;
    const str = plainNode.strValue;
    if (!str) {
      throw new Error(`Invalid file pattern: ${str}`);
    }

    const [rootStr, pattern] = str.split(':');
    if (!rootStr || !pattern) {
      throw new Error(`Invalid file pattern: ${str}`);
    }

    const rootType = parseRootType(rootStr);
    if (!rootType) {
      throw new Error(`Invalid file pattern: ${str}`);
    }

    return {rootType, pattern, substitutionKeys: getSubstitutionKeys(pattern)};
  },

  stringify: ({value}: {value: FilePattern}): string => {
    return `${value.rootType}:${value.pattern}`;
  },
});

function getSubstitutionKeys(pattern: string): Set<string> {
  // Cannot be global since this needs to be created at every call.
  const SUBSTITUTION_KEY_REGEXP = /\{([^{}]*)\}/g;
  const keys = new Set<string>();
  for (
      let result = SUBSTITUTION_KEY_REGEXP.exec(pattern);
      !!result;
      result = SUBSTITUTION_KEY_REGEXP.exec(pattern)) {
    keys.add(result[1]);
  }

  return keys;
}

import { ast, cst, Tag } from 'yaml';

import { FileRef } from '../core/file-ref';
import { isRuleRef, RuleRef } from '../core/rule-ref';

import { castAsTag } from './cast-as-tag';
import { FILE_REF_TAG } from './file-ref-tag';


export const RULE_REF_TAG: Tag = castAsTag({
  tag: 'tag:yaml.org,2002:hive/rule',

  identify: (obj: unknown): boolean => {
    return isRuleRef(obj);
  },

  resolve(_doc: ast.Document, cstNode: cst.Node): RuleRef {
    if (cstNode.type !== 'PLAIN') {
      throw new Error(`Invalid type: ${cstNode.rawValue}`);
    }

    const plainNode = cstNode as cst.PlainValue;
    const str = plainNode.strValue;
    if (!str) {
      throw new Error(`Invalid rule ref: ${str}`);
    }
    const [, , ruleName] = str.split(':');

    if (!ruleName) {
      throw new Error(`Invalid rule ref: ${str}`);
    }

    const fileRef = FILE_REF_TAG.resolve(_doc, cstNode) as unknown as FileRef;
    return {...fileRef, ruleName};
  },

  stringify: ({value}: {value: RuleRef}): string => {
    return `${value.rootType}:${value.path}:${value.ruleName}`;
  },
});

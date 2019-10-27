import { RuleRef } from '../core/rule-ref';

import { parseFileRef } from './parse-file-ref';

export function parseRuleRef(str: string): RuleRef {
  if (!str) {
    throw new Error(`Invalid rule ref: ${str}`);
  }
  const [rootStr, path, ruleName] = str.split(':');

  if (!ruleName) {
    throw new Error(`Invalid rule ref: ${str}`);
  }

  const fileRef = parseFileRef(`${rootStr}:${path}`);
  return {...fileRef, ruleName};
}

import { RuleRef } from '../../core/rule-ref';

import { parseFileRef } from './parse-file-ref';

export function parseRuleRef(raw: string): RuleRef {
  const fileRef = parseFileRef(raw.trim());
  const [path, ruleName] = fileRef.path.split(':');

  if (!ruleName) {
    throw new Error(`Invalid rule ref: ${raw}`);
  }

  return {rootType: fileRef.rootType, path, ruleName};
}

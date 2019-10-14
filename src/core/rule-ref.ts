import { FileRef, isFileRef } from './file-ref';

export interface RuleRef extends FileRef {
  readonly ruleName: string;
}

export function isRuleRef(target: unknown): target is RuleRef {
  if (!isFileRef(target)) {
    return false;
  }

  return target.hasOwnProperty('ruleName');
}

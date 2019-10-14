import { HasPropertiesType, StringType, UnionType } from '@gs-types';

import { FILE_REF_TYPE, FileRef, isFileRef } from './file-ref';


export interface RuleRef extends FileRef {
  readonly ruleName: string;
}

const RULE_TYPE = UnionType<RuleRef>([
  HasPropertiesType<{ruleName: string}>({
    ruleName: StringType,
  }),
  FILE_REF_TYPE,
]);

export function isRuleRef(target: unknown): target is RuleRef {
  return RULE_TYPE.check(target);
}

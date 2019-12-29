import { HasPropertiesType, IntersectType, StringType, Type } from '@gs-types';

import { FILE_REF_TYPE, FileRef } from './file-ref';


export interface RuleRef extends FileRef {
  readonly ruleName: string;
}

export const RULE_REF_TYPE: Type<RuleRef> = IntersectType([
  HasPropertiesType<{ruleName: string}>({
    ruleName: StringType,
  }),
  FILE_REF_TYPE,
]);

export function isRuleRef(target: unknown): target is RuleRef {
  return RULE_REF_TYPE.check(target);
}

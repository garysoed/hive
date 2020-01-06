import { Type } from '@gs-types';

import { BaseRule } from './base-rule';
import { FileRef } from './file-ref';
import { RuleType } from './rule-type';

export interface DeclareRule extends BaseRule {
  readonly inputs: ReadonlyMap<string, Type<unknown>>;
  readonly processor: FileRef;
  readonly type: RuleType.DECLARE;
}

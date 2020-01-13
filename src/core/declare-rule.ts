import { Type } from '@gs-types';

import { Serializer } from '../config/serializer/serializer';

import { BaseRule } from './base-rule';
import { FileRef } from './file-ref';
import { ResolvedRenderInput } from './render-input';
import { RuleType } from './rule-type';

export interface DeclareRule extends BaseRule {
  readonly inputs: ReadonlyMap<string, Type<unknown>>;
  readonly output: Serializer<ResolvedRenderInput>;
  readonly processor: FileRef;
  readonly type: RuleType.DECLARE;
}

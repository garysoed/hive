import { FileRef } from '../core/file-ref';
import { GlobRef } from '../core/glob-ref';
import { OutputType } from '../core/type/output-type';

import { BaseRule } from './base-rule';
import { RuleType } from './rule-type';


export interface LoadRule extends BaseRule {
  readonly outputType: OutputType;
  readonly srcs: ReadonlyArray<FileRef|GlobRef>;
  readonly type: RuleType.LOAD;
}

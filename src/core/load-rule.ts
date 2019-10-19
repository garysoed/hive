import { FileRef } from '../core/file-ref';
import { GlobRef } from '../core/glob-ref';
import { Rule } from '../core/rule';
import { OutputType } from '../core/type/output-type';

import { RuleType } from './rule-type';

export interface LoadRule extends Rule {
  readonly outputType: OutputType;
  readonly srcs: FileRef|GlobRef;
  readonly type: RuleType.LOAD;
}

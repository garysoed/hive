import {ArraySerializer} from '../config/serializer/array-serializer';
import {Serializer} from '../config/serializer/serializer';
import {FileRef} from '../core/file-ref';
import {GlobRef} from '../core/glob-ref';

import {BaseRule} from './base-rule';
import {ResolvedRenderInput} from './render-input';
import {RuleType} from './rule-type';


export interface LoadRule extends BaseRule {
  readonly output: Serializer<ResolvedRenderInput>|ArraySerializer<ResolvedRenderInput>;
  readonly srcs: ReadonlyArray<FileRef|GlobRef>;
  readonly type: RuleType.LOAD;
}

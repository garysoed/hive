import { ArrayLoader } from '../config/loader/array-loader';
import { Loader } from '../config/loader/loader';
import { FileRef } from '../core/file-ref';
import { GlobRef } from '../core/glob-ref';

import { BaseRule } from './base-rule';
import { ResolvedRenderInput } from './render-input';
import { RuleType } from './rule-type';


export interface LoadRule extends BaseRule {
  readonly output: Loader<ResolvedRenderInput>|ArrayLoader<ResolvedRenderInput>;
  readonly srcs: ReadonlyArray<FileRef|GlobRef>;
  readonly type: RuleType.LOAD;
}

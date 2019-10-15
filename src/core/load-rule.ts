import { FileRef } from '../core/file-ref';
import { GlobRef } from '../core/glob-ref';
import { Rule } from '../core/rule';
import { OutputType } from '../core/type/output-type';

export interface LoadRule extends Rule {
  srcs: FileRef|GlobRef;
  type: OutputType;
}

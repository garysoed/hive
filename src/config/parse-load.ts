import { FileRef, isFileRef } from '../core/file-ref';
import { GlobRef, isGlobRef } from '../core/glob-ref';
import { LoadRule } from '../core/load-rule';
import { RuleType } from '../core/rule-type';
import { isOutputType, OutputType } from '../core/type/output-type';

export interface LoadRaw {
  as?: OutputType;
  load?: FileRef|GlobRef;
}

export function parseLoad(ruleName: string, obj: LoadRaw): LoadRule|null {
  const {as, load} = obj;
  if (!isOutputType(as)) {
    return null;
  }

  if (!isFileRef(load) && !isGlobRef(load)) {
    return null;
  }

  return {
    name: ruleName,
    srcs: load,
    outputType: as,
    type: RuleType.LOAD,
  };
}

import {FilePattern} from '../../core/file-pattern';

import {parseFileRef} from './parse-file-ref';

export function parseFilePattern(raw: string): FilePattern {
  const fileRef = parseFileRef(raw.trim());

  return {
    rootType: fileRef.rootType,
    pattern: fileRef.path,
    substitutionKeys: getSubstitutionKeys(fileRef.path),
  };
}

function getSubstitutionKeys(pattern: string): Set<string> {
  // Cannot be global since this needs to be created at every call.
  const SUBSTITUTION_KEY_REGEXP = /\{([^{}]*)\}/g;
  const keys = new Set<string>();
  for (
    let result = SUBSTITUTION_KEY_REGEXP.exec(pattern);
    result;
    result = SUBSTITUTION_KEY_REGEXP.exec(pattern)) {
    keys.add(result[1]);
  }

  return keys;
}

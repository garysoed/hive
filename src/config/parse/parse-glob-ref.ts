import { GlobRef } from '../../core/glob-ref';

import { parseFileRef } from './parse-file-ref';

export function parseGlobRef(raw: string): GlobRef {
  if (!raw) {
    throw new Error('Glob ref is empty');
  }
  const fileRef = parseFileRef(raw.trim());

  return {rootType: fileRef.rootType, globPattern: fileRef.path};
}

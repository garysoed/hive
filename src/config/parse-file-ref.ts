import { FileRef } from '../core/file-ref';

import { parseRootType } from './parse-root-type';

export function parseFileRef(str: string): FileRef {
  const [rootStr, path] = str.split(':');
  if (!rootStr || !path) {
    throw new Error(`Invalid file ref: ${str}`);
  }

  const rootType = parseRootType(rootStr);
  if (!rootType) {
    throw new Error(`Invalid file ref: ${str}`);
  }

  return {rootType, path};
}

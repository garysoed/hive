import * as path from 'path';

import { FileRef } from '../../core/file-ref';
import { BuiltInRootType } from '../../core/root-type';


export function parseFileRef(raw: string): FileRef {
  const [prefix, ...rest] = raw.split(path.sep);
  const restPath = path.join(...rest);

  switch (prefix) {
    case '@out':
      return {path: restPath, rootType: BuiltInRootType.OUT_DIR};
    case '@root':
      return {path: restPath, rootType: BuiltInRootType.PROJECT_ROOT};
    case '':
      return {path: restPath, rootType: BuiltInRootType.SYSTEM_ROOT};
  default:
      const match = prefix.match(/@([^\/]+)/);
      if (!match) {
        return {path: raw, rootType: BuiltInRootType.CURRENT_DIR};
      }

      return {path: restPath, rootType: match[1]};
  }
}

import { RootType } from './root-type';

export interface FileRef {
  readonly path: string;
  readonly rootType: RootType;
}

export function isFileRef(target: unknown): target is FileRef {
  if (typeof target !== 'object') {
    return false;
  }

  if (!target) {
    return false;
  }

  return target.hasOwnProperty('path') && target.hasOwnProperty('rootType');
}

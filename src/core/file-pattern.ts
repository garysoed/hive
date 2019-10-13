import { RootType } from './root-type';

export interface FilePattern {
  pattern: string;
  rootType: RootType;
  substitutionKeys: Set<string>;
}

export function isFilePattern(target: unknown): target is FilePattern {
  if (typeof target !== 'object') {
    return false;
  }

  if (!target) {
    return false;
  }

  return target.hasOwnProperty('pattern') &&
      target.hasOwnProperty('rootType') &&
      target.hasOwnProperty('substitutionKeys');
}

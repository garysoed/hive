import { RootType } from './root-type';

export interface FilePattern {
  readonly pattern: string;
  readonly rootType: RootType;
  readonly substitutionKeys: ReadonlySet<string>;
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

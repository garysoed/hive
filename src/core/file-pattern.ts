import { hasPropertiesType, setOfType, stringType } from 'gs-types';

import { ROOT_TYPE_TYPE, RootType } from './root-type';


export interface FilePattern {
  readonly pattern: string;
  readonly rootType: RootType;
  readonly substitutionKeys: ReadonlySet<string>;
}

const FILE_PATTERN_TYPE = hasPropertiesType<FilePattern>({
  pattern: stringType,
  rootType: ROOT_TYPE_TYPE,
  substitutionKeys: setOfType<string>(stringType),
});

export function isFilePattern(target: unknown): target is FilePattern {
  return FILE_PATTERN_TYPE.check(target);
}

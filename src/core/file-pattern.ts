import { EnumType, HasPropertiesType, IterableOfType, StringType } from '@gs-types';

import { RootType } from './root-type';


export interface FilePattern {
  readonly pattern: string;
  readonly rootType: RootType;
  readonly substitutionKeys: ReadonlySet<string>;
}

const FILE_PATTERN_TYPE = HasPropertiesType<FilePattern>({
  pattern: StringType,
  rootType: EnumType(RootType),
  substitutionKeys: IterableOfType<string, Set<string>>(StringType),
});

export function isFilePattern(target: unknown): target is FilePattern {
  return FILE_PATTERN_TYPE.check(target);
}
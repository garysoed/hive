import { EnumType, HasPropertiesType, SetOfType, StringType } from '@gs-types';

import { BuiltInRootType } from './root-type';


export interface FilePattern {
  readonly pattern: string;
  readonly rootType: BuiltInRootType;
  readonly substitutionKeys: ReadonlySet<string>;
}

const FILE_PATTERN_TYPE = HasPropertiesType<FilePattern>({
  pattern: StringType,
  rootType: EnumType(BuiltInRootType),
  substitutionKeys: SetOfType<string>(StringType),
});

export function isFilePattern(target: unknown): target is FilePattern {
  return FILE_PATTERN_TYPE.check(target);
}

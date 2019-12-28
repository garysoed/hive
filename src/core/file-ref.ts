import { EnumType, HasPropertiesType, StringType, UnionType } from '@gs-types';

import { BuiltInRootType, RootType } from './root-type';

export interface FileRef {
  readonly path: string;
  readonly rootType: RootType;
}

export const FILE_REF_TYPE = HasPropertiesType<FileRef>({
  path: StringType,
  rootType: UnionType([EnumType(BuiltInRootType), StringType]),
});

export function isFileRef(target: unknown): target is FileRef {
  return FILE_REF_TYPE.check(target);
}

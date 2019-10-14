import { EnumType, HasPropertiesType, StringType } from '@gs-types';

import { RootType } from './root-type';

export interface FileRef {
  readonly path: string;
  readonly rootType: RootType;
}

export const FILE_REF_TYPE = HasPropertiesType<FileRef>({
  path: StringType,
  rootType: EnumType(RootType),
});

export function isFileRef(target: unknown): target is FileRef {
  return FILE_REF_TYPE.check(target);
}

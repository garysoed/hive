import { HasPropertiesType, StringType } from '@gs-types';

import { ROOT_TYPE_TYPE, RootType } from './root-type';


export interface FileRef {
  readonly path: string;
  readonly rootType: RootType;
}

export const FILE_REF_TYPE = HasPropertiesType<FileRef>({
  path: StringType,
  rootType: ROOT_TYPE_TYPE,
});

export function isFileRef(target: unknown): target is FileRef {
  return FILE_REF_TYPE.check(target);
}

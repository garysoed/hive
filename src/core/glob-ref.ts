import { EnumType, HasPropertiesType, StringType } from '@gs-types';

import { RootType } from './root-type';

export interface GlobRef {
  globPattern: string;
  rootType: RootType;
}

export const GLOB_REF_TYPE = HasPropertiesType<GlobRef>({
  globPattern: StringType,
  rootType: EnumType(RootType),
});

export function isGlobRef(target: unknown): target is GlobRef {
  return GLOB_REF_TYPE.check(target);
}

import { EnumType, HasPropertiesType, StringType } from '@gs-types';

import { BuiltInRootType } from './root-type';

export interface GlobRef {
  globPattern: string;
  rootType: BuiltInRootType;
}

export const GLOB_REF_TYPE = HasPropertiesType<GlobRef>({
  globPattern: StringType,
  rootType: EnumType(BuiltInRootType),
});

export function isGlobRef(target: unknown): target is GlobRef {
  return GLOB_REF_TYPE.check(target);
}

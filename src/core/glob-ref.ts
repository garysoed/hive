import { HasPropertiesType, StringType } from '@gs-types';

import { ROOT_TYPE_TYPE, RootType } from './root-type';


export interface GlobRef {
  globPattern: string;
  rootType: RootType;
}

export const GLOB_REF_TYPE = HasPropertiesType<GlobRef>({
  globPattern: StringType,
  rootType: ROOT_TYPE_TYPE,
});

export function isGlobRef(target: unknown): target is GlobRef {
  return GLOB_REF_TYPE.check(target);
}

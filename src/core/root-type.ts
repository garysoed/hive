import { EnumType, StringType, Type, UnionType } from '@gs-types';

export enum BuiltInRootType {
  CURRENT_DIR = 1,
  OUT_DIR = 2,
  PROJECT_ROOT = 3,
  SYSTEM_ROOT = 4,
}

export type RootType = BuiltInRootType|string;

export const ROOT_TYPE_TYPE: Type<RootType> = UnionType([
  EnumType(BuiltInRootType),
  StringType,
]);

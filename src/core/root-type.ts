export enum BuiltInRootType {
  CURRENT_DIR = 1,
  OUT_DIR = 2,
  PROJECT_ROOT = 3,
  SYSTEM_ROOT = 4,
}

export type RootType = BuiltInRootType|string;

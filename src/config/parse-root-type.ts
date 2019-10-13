import { RootType } from '../core/root-type';

export function parseRootType(rootStr: string): RootType|null {
  switch (rootStr) {
    case RootType.PROJECT_ROOT:
      return RootType.PROJECT_ROOT;
    case RootType.OUT_DIR:
      return RootType.OUT_DIR;
    case RootType.CURRENT_DIR:
      return RootType.CURRENT_DIR;
    case RootType.SYSTEM_ROOT:
      return RootType.SYSTEM_ROOT;
    default:
      return null;
  }
}

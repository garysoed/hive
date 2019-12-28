import { BuiltInRootType } from '../core/root-type';

export function parseRootType(rootStr: string): BuiltInRootType|null {
  switch (rootStr) {
    case 'root':
      return BuiltInRootType.PROJECT_ROOT;
    case 'out':
      return BuiltInRootType.OUT_DIR;
    case '.':
      return BuiltInRootType.CURRENT_DIR;
    case '/':
      return BuiltInRootType.SYSTEM_ROOT;
    default:
      return null;
  }
}

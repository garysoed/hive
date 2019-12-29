import { StringType } from '@gs-types';

import { GlobRef } from '../../core/glob-ref';
import { parseGlobRef } from '../parse/parse-glob-ref';

export function glob(args: unknown): GlobRef {
  StringType.assert(args);
  return parseGlobRef(args);
}

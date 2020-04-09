import { stringType } from 'gs-types';

import { GlobRef } from '../../core/glob-ref';
import { parseGlobRef } from '../parse/parse-glob-ref';

export function glob(args: unknown): GlobRef {
  stringType.assert(args);
  return parseGlobRef(args);
}

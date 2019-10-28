import { Observable, of as observableOf } from '@rxjs';

import { MediaTypeType } from '../core/type/media-type-type';
import { OutputType } from '../core/type/output-type';

import { parseArray } from './parse-array';
import { parseConst } from './parse-const';

export function parseContent(content: string, expectedType: OutputType): Observable<unknown> {
  if (expectedType.isArray) {
    return observableOf(parseArray(content));
  }
  if (expectedType.baseType instanceof MediaTypeType) {
    throw new Error('Unimplemented');
  }

  return observableOf(parseConst(content, expectedType.baseType));
}

import { Observable, of as observableOf } from '@rxjs';

import { MediaTypeType } from '../core/type/media-type-type';
import { OutputType } from '../core/type/output-type';

export function parseContent(content: string, expectedType: OutputType): Observable<unknown> {
  if (expectedType.baseType instanceof MediaTypeType) {
    throw new Error('Unimplemented');
  }

  return observableOf(content, expectedType.baseType);
}

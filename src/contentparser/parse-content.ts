import { Observable, of as observableOf, throwError } from '@rxjs';

import { RenderInput } from '../core/render-input';
import { RuleRef } from '../core/rule-ref';
import { MediaTypeType } from '../core/type/media-type-type';
import { OutputType } from '../core/type/output-type';

import { parseArray } from './parse-array';
import { parseConst } from './parse-const';
import { parseGoogleSheets } from './parse-google-sheets';


export function parseContent(
    content: string,
    expectedType: OutputType,
): Observable<Exclude<RenderInput, RuleRef>> {
  try {
    if (expectedType.isArray) {
      return observableOf(parseArray(content));
    }

    if (expectedType.baseType instanceof MediaTypeType) {
      switch (expectedType.baseType.type) {
        case 'application':
          switch (expectedType.baseType.subtype) {
            case 'vnd.google-apps.spreadsheet':
              return observableOf(parseGoogleSheets(content));
          }
      }

      throw new Error('Unimplemented');
    }

    return observableOf(parseConst(content, expectedType.baseType));
  } catch (e) {
    return throwError(e);
  }
}

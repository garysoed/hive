import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { map } from '@rxjs/operators';

import { RenderInput, ResolvedRenderInput } from '../core/render-input';
import { InputType } from '../core/type/input-type';
import { MediaTypeType } from '../core/type/media-type-type';
import { BaseType, OutputType } from '../core/type/output-type';

import { getTypeOfValue } from './get-type-of-value';


export function validateInputs(
    actuals: ReadonlyMap<string, ResolvedRenderInput>,
    expecteds: ReadonlyMap<string, InputType>,
): Observable<ReadonlySet<string>> {
  const actual$List: Array<Observable<[string, OutputType|'emptyArray']>> = [...actuals]
      .map(([key, renderInput]) => {
        return getTypeOfValue(renderInput).pipe(
            map(type => [key, type]),
        );
      });

  const actualValues$: Observable<Array<[string, OutputType|'emptyArray']>> =
      actual$List.length <= 0 ? observableOf([]) : combineLatest(actual$List);

  return actualValues$
      .pipe(
          map(actualValuePairs => new Map(actualValuePairs)),
          map(actuals => {
            debugger;
            const repeatedKeys = new Set<string>();
            for (const [key, expected] of expecteds) {
              const actual = actuals.get(key);
              if (actual === undefined) {
                throw new Error(`Missing value for key ${key}`);
              }

              if (expected.isArray) {
                if (actual === 'emptyArray') {
                  continue;
                }

                if (!actual.isArray) {
                  throw new Error(`Value for ${key} is incompatible`);
                }

                if (!isBaseTypeCompatible(actual.baseType, expected)) {
                  throw new Error(`Value for ${key} is incompatible`);
                }

                continue;
              }

              if (actual === 'emptyArray') {
                repeatedKeys.add(key);
                continue;
              }

              if (!isBaseTypeCompatible(actual.baseType, expected)) {
                throw new Error(`Value for ${key} is incompatible`);
              }

              if (actual.isArray) {
                repeatedKeys.add(key);
              }
            }

            return repeatedKeys;
          }),
      );
}

function isBaseTypeCompatible(actual: BaseType, expected: InputType): boolean {
  if (!(actual instanceof MediaTypeType)) {
    return expected.matcher.test(actual);
  }

  return expected.matcher.test(actual.stringify());
}

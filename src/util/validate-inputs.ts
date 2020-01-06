import { ArrayOfType, Type } from '@gs-types';

import { ResolvedRenderInput } from '../core/render-input';


export function validateInputs(
    actuals: ReadonlyMap<string, ResolvedRenderInput>,
    expecteds: ReadonlyMap<string, Type<unknown>>,
): ReadonlySet<string> {
  const repeatedKeys = new Set<string>();
  for (const [key, expected] of expecteds) {
    const actual = actuals.get(key);
    if (actual === undefined) {
      throw new Error(`Missing value for key ${key}`);
    }

    if (expected instanceof ArrayOfType) {
      const expectedArrayType: ArrayOfType<unknown> = expected;
      expectedArrayType.assert(actual);

      continue;
    }

    const expectedNonArray: Type<unknown> = expected;

    if (!(actual instanceof Array)) {
      expectedNonArray.assert(actual);
      continue;
    }

    for (const item of actual) {
      expectedNonArray.assert(item);
    }

    repeatedKeys.add(key);
  }

  return repeatedKeys;
}

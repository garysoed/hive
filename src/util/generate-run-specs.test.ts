import { assert, match, MatcherType, should, test } from '@gs-testing';

import { generateRunSpecs, RunSpec } from './generate-run-specs';

function matchRunSpec(inputs: Map<string, unknown>, outputPath: string): MatcherType<RunSpec> {
  return match.anyObjectThat<RunSpec>().haveProperties({
    inputs: match.anyMapThat().haveExactElements(inputs),
    outputPath,
  });
}

test('@hive/util/generate-run-specs', () => {
  should(`handle repeated keys correctly`, () => {
    const inputs = new Map<string, unknown>([
      ['a', [1, 2, 3]],
      ['b', ['a', 'b']],
    ]);
    const repeatedKeys = new Set(['a', 'b']);

    assert(generateRunSpecs(inputs, repeatedKeys, '{a}_{b}.txt')).to.haveExactElements([
      matchRunSpec(new Map<string, unknown>([['a', 1], ['b', 'a']]), '1_a.txt'),
      matchRunSpec(new Map<string, unknown>([['a', 1], ['b', 'b']]), '1_b.txt'),
      matchRunSpec(new Map<string, unknown>([['a', 2], ['b', 'a']]), '2_a.txt'),
      matchRunSpec(new Map<string, unknown>([['a', 2], ['b', 'b']]), '2_b.txt'),
      matchRunSpec(new Map<string, unknown>([['a', 3], ['b', 'a']]), '3_a.txt'),
      matchRunSpec(new Map<string, unknown>([['a', 3], ['b', 'b']]), '3_b.txt'),
    ]);
  });

  should(`handle non repeated keys correctly`, () => {
    const inputs = new Map<string, unknown>([
      ['a', [1, 2, 3]],
      ['b', ['a', 'b']],
    ]);
    const repeatedKeys = new Set([]);

    assert(generateRunSpecs(inputs, repeatedKeys, '{a}_{b}.txt')).to.haveExactElements([
      matchRunSpec(
          new Map<string, unknown>([
            ['a', match.anyArrayThat().haveExactElements([1, 2, 3])],
            ['b', match.anyArrayThat().haveExactElements(['a', 'b'])],
          ]),
          '{a}_{b}.txt',
      ),
    ]);
  });

  should(`throw error if a repeated key's value isn't an array`, () => {
    const inputs = new Map<string, unknown>([
      ['a', 123],
      ['b', ['a', 'b']],
    ]);
    const repeatedKeys = new Set(['a', 'b']);

    assert(() => generateRunSpecs(inputs, repeatedKeys, '{a}_{b}.txt')).to
        .throwErrorWithMessage(/is not an array/);
  });
});

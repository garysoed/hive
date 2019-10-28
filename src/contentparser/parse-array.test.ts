import { assert, match, should, test } from '@gs-testing';

import { parseArray } from './parse-array';

test('@hive/contentparser/parse-array', () => {
  should(`parse arrays correctly`, () => {
    assert(parseArray('[1, 2, 3]')).to.equal(match.anyArrayThat().haveExactElements([1, 2, 3]));
  });

  should(`return array with one element if parses into a non array`, () => {
    assert(parseArray('123')).to.equal(match.anyArrayThat().haveExactElements([123]));
  });
});

import { assert, should, test } from '@gs-testing';

import { objectToMap } from './object-to-map';

test('@hive/config/object-to-map', () => {
  should(`create the map correctly`, () => {
    const c = {};
    const map = objectToMap({a: 1, b: 'two', c});

    assert(map).to.haveElements([
      ['a', 1],
      ['b', 'two'],
      ['c', c],
    ]);
  });
});

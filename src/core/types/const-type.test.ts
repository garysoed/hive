import { assert, should, test } from '@gs-testing';

import { AcceptanceLevel } from './acceptance-level';
import { BOOLEAN_TYPE, NUMBER_TYPE } from './const-type';

test('@hive/core/types/const-type', () => {
  test('accepts', () => {
    should(`return ACCEPTABLE if the other type is the same`, () => {
      assert(BOOLEAN_TYPE.accepts(BOOLEAN_TYPE)).to.equal(AcceptanceLevel.ACCEPTABLE);
    });

    should(`return UNACCEPTABLE if the other type is not the same`, () => {
      assert(BOOLEAN_TYPE.accepts(NUMBER_TYPE)).to.equal(AcceptanceLevel.UNACCEPTABLE);
    });
  });
});

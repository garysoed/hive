import { assert, should, test } from '@gs-testing';

import { AcceptanceLevel } from './acceptance-level';
import { BOOLEAN_ARRAY_TYPE, NUMBER_ARRAY_TYPE } from './array-type';
import { BOOLEAN_TYPE, NUMBER_TYPE } from './const-type';

test('@hive/core/types/array-type', () => {
  test('accepts', () => {
    should(`return ACCEPTABLE if the two types are the same`, () => {
      assert(BOOLEAN_ARRAY_TYPE.accepts(BOOLEAN_ARRAY_TYPE)).to.equal(AcceptanceLevel.ACCEPTABLE);
    });

    should(
        `return ACCEPTABLE_AS_ELEMENT if the other has the same type as the element type`,
        () => {
          assert(BOOLEAN_ARRAY_TYPE.accepts(BOOLEAN_TYPE)).to
              .equal(AcceptanceLevel.ACCEPTABLE_AS_ELEMENT);
        });

    should(`return UNACCEPTABLE if the other type is array of different element`, () => {
      assert(BOOLEAN_ARRAY_TYPE.accepts(NUMBER_ARRAY_TYPE)).to .equal(AcceptanceLevel.UNACCEPTABLE);
    });

    should(
          `return UNACCEPTABLE if the other type is type that is not the element type`, () => {
      assert(BOOLEAN_ARRAY_TYPE.accepts(NUMBER_TYPE)).to .equal(AcceptanceLevel.UNACCEPTABLE);
    });
  });

  test('stringify', () => {
    should(`return the correct string`, () => {
      assert(BOOLEAN_ARRAY_TYPE.stringify()).to.equal('boolean[]');
    });
  });
});

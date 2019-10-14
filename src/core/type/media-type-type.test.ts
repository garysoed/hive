import { assert, setup, should, test } from '@gs-testing';

import { MediaTypeType } from './media-type-type';

test('@hive/core/type/media-type-type', () => {
  const EXPECTED_TYPE = 'media-type';
  const EXPECTED_SUBTYPE = 'media-subtype';

  let type: MediaTypeType;

  setup(() => {
    type = new MediaTypeType(EXPECTED_TYPE, EXPECTED_SUBTYPE);
  });

  test('check', () => {
    should(`return true if the target is a valid media type`, () => {
      assert(type.check({type: EXPECTED_TYPE, subtype: EXPECTED_SUBTYPE})).to.beTrue();
    });

    should(`return false if the target has a different subtype`, () => {
      assert(type.check({type: EXPECTED_TYPE, subtype: 'other'})).to.beFalse();
    });

    should(`return false if the target has a different type`, () => {
      assert(type.check({type: 'other', subtype: EXPECTED_SUBTYPE})).to.beFalse();
    });
  });

  test('stringify', () => {
    should(`return the correct string`, () => {
      assert(type.stringify()).to.equal(`${EXPECTED_TYPE}/${EXPECTED_SUBTYPE}`);
    });
  });
});

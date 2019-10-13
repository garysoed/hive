import * as yaml from 'yaml';

import { assert, should, test } from '@gs-testing';

import { BOOLEAN_ARRAY_TYPE } from '../core/types/array-type';
import { BOOLEAN_TYPE } from '../core/types/const-type';

import { TYPE_TAG } from './type-tag';

test('@hive/config/type-tag', () => {
  test('resolve', () => {
    should(`parse const type correctly`, () => {
      assert(yaml.parse('!!hive/type boolean', {tags: [TYPE_TAG]})).to.equal(BOOLEAN_TYPE);
    });

    should(`parse array type correctly`, () => {
      assert(yaml.parse('!!hive/type boolean[]', {tags: [TYPE_TAG]})).to.equal(BOOLEAN_ARRAY_TYPE);
    });

    should(`throw error if an invalid type`, () => {
      assert(() => yaml.parse('!!hive/type unknown', {tags: [TYPE_TAG]}))
          .to.throwErrorWithMessage(/Invalid type/);
    });
  });

  test('stringify', () => {
    should(`stringify const type correctly`, () => {
      assert(yaml.stringify(BOOLEAN_TYPE, {tags: [TYPE_TAG]})).to.match(/^!!hive\/type boolean/);
    });

    should(`stringify array type correctly`, () => {
      assert(yaml.stringify(BOOLEAN_ARRAY_TYPE, {tags: [TYPE_TAG]})).to
          .match(/^!!hive\/type boolean\[\]/);
    });
  });
});

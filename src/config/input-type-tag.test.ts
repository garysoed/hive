import * as yaml from 'yaml';

import { assert, objectThat, should, test } from '@gs-testing';

import { INPUT_TYPE_TAG } from './input-type-tag';

test('@hive/config/input-type-tag', () => {
  test('resolve', () => {
    should(`parse valid regex correctly`, () => {
      assert(yaml.parse('!!hive/i_type abc:gi', {tags: [INPUT_TYPE_TAG]})).to
          .equal(objectThat().haveProperties({
            isArray: false,
            matcher: objectThat().haveProperties({
              source: 'abc',
              flags: 'gi',
            }),
          }));
    });

    should(`parse valid regex without flags correctly`, () => {
      assert(yaml.parse('!!hive/i_type abc', {tags: [INPUT_TYPE_TAG]})).to
          .equal(objectThat().haveProperties({
            isArray: false,
            matcher: objectThat().haveProperties({
              source: 'abc',
              flags: '',
            }),
          }));
    });

    should(`parse valid regex array correctly`, () => {
      assert(yaml.parse('!!hive/i_type abc:gi[]', {tags: [INPUT_TYPE_TAG]})).to
          .equal(objectThat().haveProperties({
            isArray: true,
            matcher: objectThat().haveProperties({
              source: 'abc',
              flags: 'gi',
            }),
          }));
    });

    should(`parse valid regex array without flags correctly`, () => {
      assert(yaml.parse('!!hive/i_type abc:[]', {tags: [INPUT_TYPE_TAG]})).to
          .equal(objectThat().haveProperties({
            isArray: true,
            matcher: objectThat().haveProperties({
              source: 'abc',
              flags: '',
            }),
          }));
    });

    should(`throw error if value is empty`, () => {
      assert(() => yaml.parse('!!hive/i_type', {tags: [INPUT_TYPE_TAG]})).to
          .throwErrorWithMessage(/Invalid input type/);
    });

    should(`handle trailing white spaces`, () => {
      assert(yaml.parse('!!hive/i_type abc:gi\n   ', {tags: [INPUT_TYPE_TAG]})).to
          .equal(objectThat().haveProperties({
            matcher: objectThat().haveProperties({
              source: 'abc',
              flags: 'gi',
            }),
          }));
    });
  });

  test('stringify', () => {
    should(`stringify correctly`, () => {
      assert(yaml.stringify({isArray: false, matcher: /abc/gi}, {tags: [INPUT_TYPE_TAG]})).to
          .match(/^!!hive\/i_type abc:gi/);
    });

    should(`stringify arrays correctly`, () => {
      assert(yaml.stringify({isArray: true, matcher: /abc/gi}, {tags: [INPUT_TYPE_TAG]})).to
          .match(/^!!hive\/i_type abc:gi\[\]/);
    });
  });
});

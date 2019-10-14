import * as yaml from 'yaml';

import { assert, match, should, test } from '@gs-testing';

import { INPUT_TYPE_TAG } from './input-type-tag';

test('@hive/config/input-type-tag', () => {
  test('resolve', () => {
    should(`parse valid regex correctly`, () => {
      assert(yaml.parse('!!hive/i_type abc:gi', {tags: [INPUT_TYPE_TAG]})).to
          .equal(match.anyObjectThat().haveProperties({
            matcher: match.anyObjectThat().haveProperties({
              source: 'abc',
              flags: 'gi',
            }),
          }));
    });

    should(`parse valid regex without flags correctly`, () => {
      assert(yaml.parse('!!hive/i_type abc', {tags: [INPUT_TYPE_TAG]})).to
          .equal(match.anyObjectThat().haveProperties({
            matcher: match.anyObjectThat().haveProperties({
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
          .equal(match.anyObjectThat().haveProperties({
            matcher: match.anyObjectThat().haveProperties({
              source: 'abc',
              flags: 'gi',
            }),
          }));
    });
  });

  test('stringify', () => {
    should(`stringify correctly`, () => {
      assert(yaml.stringify({matcher: /abc/gi}, {tags: [INPUT_TYPE_TAG]})).to
          .match(/^!!hive\/i_type abc:gi/);
    });
  });
});

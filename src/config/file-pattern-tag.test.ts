import * as yaml from 'yaml';

import { assert, objectThat, setThat, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';

import { FILE_PATTERN_TAG } from './file-pattern-tag';

test('@hive/config/file-pattern-tag', () => {
  test('resolve', () => {
    should(`handle correct file patterns`, () => {
      const raw = `!!hive/pattern /:file/pattern/{input1}_{input2}`;
      assert(yaml.parse(raw, {tags: [FILE_PATTERN_TAG]})).to
          .equal(objectThat().haveProperties({
            rootType: RootType.SYSTEM_ROOT,
            pattern: 'file/pattern/{input1}_{input2}',
            substitutionKeys: setThat().haveExactElements(new Set(['input1', 'input2'])),
          }));
    });

    should(`throw error if root type is invalid`, () => {
      const raw = `!!hive/pattern invalid:file/pattern/{input1}_{input2}`;
      assert(() => yaml.parse(raw, {tags: [FILE_PATTERN_TAG]})).to
          .throwErrorWithMessage(/Invalid file pattern/);
    });

    should(`throw error if missing the path`, () => {
      const raw = `!!hive/pattern /:`;
      assert(() => yaml.parse(raw, {tags: [FILE_PATTERN_TAG]})).to
          .throwErrorWithMessage(/Invalid file pattern/);
    });

    should(`throw error if missing the root type`, () => {
      const raw = `!!hive/pattern :file/pattern/{input1}_{input2}`;
      assert(() => yaml.parse(raw, {tags: [FILE_PATTERN_TAG]})).to
          .throwErrorWithMessage(/Invalid file pattern/);
    });

    should(`throw error if value is missing`, () => {
      const raw = `!!hive/pattern`;
      assert(() => yaml.parse(raw, {tags: [FILE_PATTERN_TAG]})).to
          .throwErrorWithMessage(/Invalid file pattern/);
    });

    should(`handle white spaces`, () => {
      const raw = `!!hive/pattern /:file/pattern/{input1}_{input2}\n   `;
      assert(yaml.parse(raw, {tags: [FILE_PATTERN_TAG]})).to
          .equal(objectThat().haveProperties({
            rootType: RootType.SYSTEM_ROOT,
            pattern: 'file/pattern/{input1}_{input2}',
            substitutionKeys: setThat().haveExactElements(new Set(['input1', 'input2'])),
          }));
    });
  });

  test('stringify', () => {
    should(`stringify patterns correctly`, () => {
      const pattern = 'file/pattern/{input1}_{input2}';
      const value = {
        rootType: RootType.OUT_DIR,
        pattern,
        substitutionKeys: new Set(['input1', 'input2']),
      };

      assert(yaml.stringify(value, {tags: [FILE_PATTERN_TAG]})).to
          .match(/!!hive\/pattern out:file\/pattern\/\{input1\}_\{input2\}/);
    });
  });
});

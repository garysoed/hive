import * as yaml from 'yaml';

import { assert, objectThat, should, test } from '@gs-testing';

import { BuiltInRootType } from '../core/root-type';

import { GLOB_REF_TAG } from './glob-ref-tag';


test('@hive/config/glob-ref-tag', () => {
  test('resolve', () => {
    should(`parse correctly`, () => {
      assert(yaml.parse('!!hive/glob out:glob/path/*.txt', {tags: [GLOB_REF_TAG]})).to
          .equal(objectThat().haveProperties({
            rootType: BuiltInRootType.OUT_DIR,
            globPattern: 'glob/path/*.txt',
          }));
    });

    should(`throw error if root type is invalid`, () => {
      assert(() => yaml.parse('!!hive/glob invalid:glob/path/*.txt', {tags: [GLOB_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid glob ref/);
    });

    should(`throw error if glob pattern is missing`, () => {
      assert(() => yaml.parse('!!hive/glob invalid:', {tags: [GLOB_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid glob ref/);
    });

    should(`throw error if root type is missing`, () => {
      assert(() => yaml.parse('!!hive/glob :glob/path/*.txt', {tags: [GLOB_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid glob ref/);
    });

    should(`throw error if value is missing`, () => {
      assert(() => yaml.parse('!!hive/glob', {tags: [GLOB_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid glob ref/);
    });

    should(`handle white spaces`, () => {
      assert(yaml.parse('!!hive/glob out:glob/path/*.txt\n   ', {tags: [GLOB_REF_TAG]})).to
          .equal(objectThat().haveProperties({
            rootType: BuiltInRootType.OUT_DIR,
            globPattern: 'glob/path/*.txt',
        }));
    });
  });
});

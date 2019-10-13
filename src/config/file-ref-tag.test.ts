import * as yaml from 'yaml';

import { assert, match, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';

import { FILE_REF_TAG } from './file-ref-tag';

test('@hive/config/file-ref-tag', () => {
  test('resolve', () => {
    should(`parse project root based path correctly`, () => {
      assert(yaml.parse('!!hive/file root:path/to/file.txt', {tags: [FILE_REF_TAG]})).to
          .equal(match.anyObjectThat().haveProperties({
            rootType: RootType.PROJECT_ROOT,
            path: 'path/to/file.txt',
          }));
    });

    should(`parse current directory based path correctly`, () => {
      assert(yaml.parse('!!hive/file .:path/to/file.txt', {tags: [FILE_REF_TAG]})).to
          .equal(match.anyObjectThat().haveProperties({
            rootType: RootType.CURRENT_DIR,
            path: 'path/to/file.txt',
          }));
    });

    should(`parse system root based path correctly`, () => {
      assert(yaml.parse('!!hive/file /:path/to/file.txt', {tags: [FILE_REF_TAG]})).to
          .equal(match.anyObjectThat().haveProperties({
            rootType: RootType.SYSTEM_ROOT,
            path: 'path/to/file.txt',
          }));
    });

    should(`throw error if root type is invalid`, () => {
      assert(() => yaml.parse('!!hive/file invalid:path/to/file.txt', {tags: [FILE_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid file ref/);
    });

    should(`throw error if path is missing`, () => {
      assert(() => yaml.parse('!!hive/file /:', {tags: [FILE_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid file ref/);
    });

    should(`throw error if root type is missing`, () => {
      assert(() => yaml.parse('!!hive/file :path/to/file.txt', {tags: [FILE_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid file ref/);
    });

    should(`throw error if value is missing`, () => {
      assert(() => yaml.parse('!!hive/file', {tags: [FILE_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid file ref/);
    });

    should(`handle white spaces`, () => {
      assert(yaml.parse('!!hive/file root:path/to/file.txt\n    ', {tags: [FILE_REF_TAG]})).to
          .equal(match.anyObjectThat().haveProperties({
            rootType: RootType.PROJECT_ROOT,
            path: 'path/to/file.txt',
          }));
    });
  });

  test('stringify', () => {
    should(`stringify path correctly`, () => {
      const path = 'path/to/file.txt';
      const value = {
        rootType: RootType.OUT_DIR,
        path,
      };

      assert(yaml.stringify(value, {tags: [FILE_REF_TAG]})).to
          .match(/!!hive\/file out:path\/to\/file\.txt/);
    });
  });
});

import { assert, match, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';

import { parseFileRef } from './parse-file-ref';

test('@hive/config/parse-file-ref', () => {
  should(`parse project root based path correctly`, () => {
    assert(parseFileRef('root:path/to/file.txt')).to
        .equal(match.anyObjectThat().haveProperties({
          rootType: RootType.PROJECT_ROOT,
          path: 'path/to/file.txt',
        }));
  });

  should(`parse current directory based path correctly`, () => {
    assert(parseFileRef('.:path/to/file.txt')).to
        .equal(match.anyObjectThat().haveProperties({
          rootType: RootType.CURRENT_DIR,
          path: 'path/to/file.txt',
        }));
  });

  should(`parse system root based path correctly`, () => {
    assert(parseFileRef('/:path/to/file.txt')).to
        .equal(match.anyObjectThat().haveProperties({
          rootType: RootType.SYSTEM_ROOT,
          path: 'path/to/file.txt',
        }));
  });

  should(`throw error if root type is invalid`, () => {
    assert(() => parseFileRef('invalid:path/to/file.txt')).to
        .throwErrorWithMessage(/Invalid file ref/);
  });

  should(`throw error if path is missing`, () => {
    assert(() => parseFileRef('/:')).to
        .throwErrorWithMessage(/Invalid file ref/);
  });

  should(`throw error if root type is missing`, () => {
    assert(() => parseFileRef(':path/to/file.txt')).to
        .throwErrorWithMessage(/Invalid file ref/);
  });
});

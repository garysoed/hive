import { assert, setup, should, test } from '@gs-testing';

import { addFile, mockFs } from '../testing/fake-fs';

import { readFile } from './read-file';

test('@hive/util/read-file', () => {
  setup(() => {
    mockFs();
  });

  should(`emit the file content`, () => {
    const path = 'path';
    const content = 'content';

    addFile(path, {content});

    assert(readFile(path)).to.emitSequence([content]);
  });

  should(`throw on error`, () => {
    assert(readFile('path')).to.emitErrorWithMessage(/not found/);
  });
});

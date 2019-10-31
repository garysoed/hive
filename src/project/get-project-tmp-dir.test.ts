import * as path from 'path';

import { assert, setup, should, test } from '@gs-testing';

import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { ROOT_FILE_NAME } from './find-root';
import { getProjectTmpDir, TMP_DIR_NAME } from './get-project-tmp-dir';

test('@hive/project/get-project-tmp-dir', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  should(`emit the correct path`, () => {
    const root = '/path/to/root';
    const content = `
    globals:
    outdir: out/
    `;
    addFile(path.join(root, ROOT_FILE_NAME), {content});
    setCwd(root);

    assert(getProjectTmpDir()).to.emitSequence([path.join(root, TMP_DIR_NAME)]);
  });

  should(`emit null if root is not found`, () => {
    assert(getProjectTmpDir()).to.emitSequence([null]);
  });
});

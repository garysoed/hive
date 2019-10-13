import * as nodePath from 'path';

import { assert, setup, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';
import { ROOT_FILE_NAME } from '../project/find-root';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { resolveFileRef } from './resolve-file-ref';

test('@hive/util/resolve-file-ref', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  should(`return based on cwd if root type is CURRENT_DIR`, () => {
    const current = 'current';
    setCwd(current);

    const path = 'path';
    assert(resolveFileRef({rootType: RootType.CURRENT_DIR, path})).to.emitSequence([
      nodePath.join(current, path),
    ]);
  });

  should(`return based on the out dir if root type is OUT_DIR`, () => {
    setCwd('/a/b/c');

    const outdir = '/outdir';
    addFile(nodePath.join('/a', ROOT_FILE_NAME), {content: `outdir: ${outdir}`});

    const path = 'path';
    assert(resolveFileRef({rootType: RootType.OUT_DIR, path})).to.emitSequence([
      nodePath.join(outdir, path),
    ]);
  });

  should(`return based on project root if root type is PROJECT_ROOT`, () => {
    const projectRoot = '/a';
    setCwd('/a/b/c');

    addFile(nodePath.join(projectRoot, ROOT_FILE_NAME), {content: `outdir: '/'`});

    const path = 'path';
    assert(resolveFileRef({rootType: RootType.PROJECT_ROOT, path})).to.emitSequence([
      nodePath.join(projectRoot, path),
    ]);
  });

  should(`return based on system root if root type is SYSTEM_ROOT`, () => {
    const path = 'path';
    assert(resolveFileRef({rootType: RootType.SYSTEM_ROOT, path})).to.emitSequence([
      nodePath.join('/', path),
    ]);
  });

  should(`throw error if root type is PROJECT_ROOT but no project root is found`, () => {
    const path = 'path';
    assert(resolveFileRef({rootType: RootType.PROJECT_ROOT, path})).to
        .emitErrorWithMessage(/Cannot find project root/);
  });
});

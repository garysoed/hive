import * as path from 'path';

import { assert, setup, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';
import { ROOT_FILE_NAME } from '../project/find-root';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { resolveRoot } from './resolve-root';


test('@hive/util/resolve-root', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  should(`emit the current directory if root type is CURRENT_DIR`, () => {
    const current = 'current';
    setCwd(current);

    assert(resolveRoot(RootType.CURRENT_DIR)).to.emitSequence([current]);
  });

  should(`emit the out directory if the root type is OUT_DIR`, () => {
    setCwd('/a/b/c');

    const outdir = '/outdir';
    addFile(path.join('/a', ROOT_FILE_NAME), {content: JSON.stringify({outdir})});

    assert(resolveRoot(RootType.OUT_DIR)).to.emitSequence([outdir]);
  });

  should(`emit the out directory relative to the root directory the root type is OUT_DIR`, () => {
    setCwd('/a/b/c');

    const outdir = 'outdir';
    addFile(path.join('/a', ROOT_FILE_NAME), {content: JSON.stringify({outdir})});

    assert(resolveRoot(RootType.OUT_DIR)).to.emitSequence([path.join('/a', outdir)]);
  });

  should(`emit the project root if the root type is PROJECT_ROOT`, () => {
    const projectRoot = '/a';
    setCwd('/a/b/c');

    addFile(path.join(projectRoot, ROOT_FILE_NAME), {content: `outdir: '/'`});

    assert(resolveRoot(RootType.PROJECT_ROOT)).to.emitSequence([projectRoot]);
  });

  should(`emit error if root type is PROJECT_ROOT but cannot find project root`, () => {
    assert(resolveRoot(RootType.PROJECT_ROOT)).to
        .emitErrorWithMessage(/Cannot find project root/);
  });

  should(`emit "/" if root type is SYSTEM_ROOT`, () => {
    assert(resolveRoot(RootType.SYSTEM_ROOT)).to.emitSequence(['/']);
  });
});

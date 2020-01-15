import * as path from 'path';

import { assert, setup, should, test } from '@gs-testing';

import { BuiltInRootType } from '../core/root-type';
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
    const cwd = 'cwd';
    setCwd(cwd);

    assert(resolveRoot(BuiltInRootType.CURRENT_DIR, cwd)).to.emitSequence([cwd]);
  });

  should(`emit the out directory if the root type is OUT_DIR`, () => {
    setCwd('/a/b/c');

    const outdir = '/outdir';
    addFile(path.join('/a', ROOT_FILE_NAME), {content: JSON.stringify({outdir})});

    const cwd = 'cwd';
    assert(resolveRoot(BuiltInRootType.OUT_DIR, cwd)).to.emitSequence([outdir]);
  });

  should(`emit the out directory relative to the root directory the root type is OUT_DIR`, () => {
    setCwd('/a/b/c');

    const outdir = 'outdir';
    addFile(path.join('/a', ROOT_FILE_NAME), {content: JSON.stringify({outdir})});

    const cwd = 'cwd';
    assert(resolveRoot(BuiltInRootType.OUT_DIR, cwd)).to.emitSequence([path.join('/a', outdir)]);
  });

  should(`emit the project root if the root type is PROJECT_ROOT`, () => {
    const projectRoot = '/a';
    setCwd('/a/b/c');

    addFile(path.join(projectRoot, ROOT_FILE_NAME), {content: `outdir: '/'`});

    const cwd = 'cwd';
    assert(resolveRoot(BuiltInRootType.PROJECT_ROOT, cwd)).to.emitSequence([projectRoot]);
  });

  should(`emit error if root type is PROJECT_ROOT but cannot find project root`, () => {
    const cwd = 'cwd';
    assert(resolveRoot(BuiltInRootType.PROJECT_ROOT, cwd)).to
        .emitErrorWithMessage(/Cannot find project root/);
  });

  should(`emit "/" if root type is SYSTEM_ROOT`, () => {
    const cwd = 'cwd';
    assert(resolveRoot(BuiltInRootType.SYSTEM_ROOT, cwd)).to.emitSequence(['/']);
  });

  should(`emit custom root if specified`, () => {
    setCwd('/a/b/c');

    const outdir = '/outdir';
    const custom = '/path/to/custom';
    const content = JSON.stringify({
      outdir,
      roots: {custom},
    });
    addFile(path.join('/a', ROOT_FILE_NAME), {content});

    const cwd = 'cwd';
    assert(resolveRoot('custom', cwd)).to.emitSequence([custom]);
  });

  should(`emit error if the custom root is not specified`, () => {
    setCwd('/a/b/c');

    const outdir = '/outdir';
    const content = JSON.stringify({outdir});
    addFile(path.join('/a', ROOT_FILE_NAME), {content});

    const cwd = 'cwd';
    assert(resolveRoot('custom', cwd)).to.emitErrorWithMessage(/cannot find root/i);
  });
});

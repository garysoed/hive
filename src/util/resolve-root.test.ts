import * as path from 'path';

import {Vine} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {FakeFs, FakeProcess} from 'gs-testing/export/fake';

import {BuiltInRootType} from '../core/root-type';
import {$fs} from '../external/fs';
import {$process} from '../external/process';
import {ROOT_FILE_NAME} from '../project/find-root';

import {resolveRoot} from './resolve-root';


test('@hive/util/resolve-root', init => {
  const _ = init(() => {
    const fakeFs = new FakeFs();
    const fakeProcess = new FakeProcess();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $fs, withValue: fakeFs},
        {override: $process, withValue: fakeProcess},
      ],
    });
    return {fakeFs, fakeProcess, vine};
  });

  should('emit the current directory if root type is CURRENT_DIR', () => {
    const cwd = 'cwd';
    _.fakeProcess.setCwd(cwd);

    assert(resolveRoot(_.vine, BuiltInRootType.CURRENT_DIR, cwd)).to.emitSequence([cwd]);
  });

  should('emit the out directory if the root type is OUT_DIR', () => {
    _.fakeProcess.setCwd('/a/b/c');

    const outdir = '/outdir';
    _.fakeFs.addFile(path.join('/a', ROOT_FILE_NAME), {content: JSON.stringify({outdir})});

    const cwd = 'cwd';
    assert(resolveRoot(_.vine, BuiltInRootType.OUT_DIR, cwd)).to.emitSequence([outdir]);
  });

  should('emit the out directory relative to the root directory the root type is OUT_DIR', () => {
    _.fakeProcess.setCwd('/a/b/c');

    const outdir = 'outdir';
    _.fakeFs.addFile(path.join('/a', ROOT_FILE_NAME), {content: JSON.stringify({outdir})});

    const cwd = 'cwd';
    assert(resolveRoot(_.vine, BuiltInRootType.OUT_DIR, cwd)).to.emitSequence([path.join('/a', outdir)]);
  });

  should('emit the project root if the root type is PROJECT_ROOT', () => {
    const projectRoot = '/a';
    _.fakeProcess.setCwd('/a/b/c');

    _.fakeFs.addFile(path.join(projectRoot, ROOT_FILE_NAME), {content: 'outdir: \'/\''});

    const cwd = 'cwd';
    assert(resolveRoot(_.vine, BuiltInRootType.PROJECT_ROOT, cwd)).to.emitSequence([projectRoot]);
  });

  should('emit error if root type is PROJECT_ROOT but cannot find project root', () => {
    const cwd = 'cwd';
    assert(resolveRoot(_.vine, BuiltInRootType.PROJECT_ROOT, cwd)).to
        .emitErrorWithMessage(/Cannot find project root/);
  });

  should('emit "/" if root type is SYSTEM_ROOT', () => {
    const cwd = 'cwd';
    assert(resolveRoot(_.vine, BuiltInRootType.SYSTEM_ROOT, cwd)).to.emitSequence(['/']);
  });

  should('emit custom root if specified', () => {
    _.fakeProcess.setCwd('/a/b/c');

    const outdir = '/outdir';
    const custom = '/path/to/custom';
    const content = JSON.stringify({
      outdir,
      roots: {custom},
    });
    _.fakeFs.addFile(path.join('/a', ROOT_FILE_NAME), {content});

    const cwd = 'cwd';
    assert(resolveRoot(_.vine, 'custom', cwd)).to.emitSequence([custom]);
  });

  should('emit error if the custom root is not specified', () => {
    _.fakeProcess.setCwd('/a/b/c');

    const outdir = '/outdir';
    const content = JSON.stringify({outdir});
    _.fakeFs.addFile(path.join('/a', ROOT_FILE_NAME), {content});

    const cwd = 'cwd';
    assert(resolveRoot(_.vine, 'custom', cwd)).to.emitErrorWithMessage(/cannot find root/i);
  });
});

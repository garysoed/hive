import * as nodePath from 'path';

import {Vine} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {FakeFs, FakeProcess} from 'gs-testing/export/fake';

import {BuiltInRootType} from '../core/root-type';
import {$fs} from '../external/fs';
import {$process} from '../external/process';
import {ROOT_FILE_NAME} from '../project/find-root';


import {resolveFileRef} from './resolve-file-ref';


test('@hive/util/resolve-file-ref', () => {
  const _ = setup(() => {
    const fakeFs = new FakeFs();
    const fakeProcess = new FakeProcess();
    const vine = new Vine({
      overrides: [
        {override: $fs, withValue: fakeFs},
        {override: $process, withValue: fakeProcess},
      ],
    });
    return {fakeFs, fakeProcess, vine};
  });

  should('return based on cwd if root type is CURRENT_DIR', async () => {
    const cwd = 'cwd';
    _.fakeProcess.setCwd(cwd);

    const path = 'path';
    await asyncAssert(resolveFileRef(_.vine, {rootType: BuiltInRootType.CURRENT_DIR, path}, cwd))
        .to.emitSequence([
          nodePath.join(cwd, path),
        ]);
  });

  should('return based on the out dir if root type is OUT_DIR', async () => {
    _.fakeProcess.setCwd('/a/b/c');

    const outdir = '/outdir';
    _.fakeFs.addFile(nodePath.join('/a', ROOT_FILE_NAME), {content: JSON.stringify({outdir})});

    const path = 'path';
    const cwd = 'cwd';
    await asyncAssert(resolveFileRef(_.vine, {rootType: BuiltInRootType.OUT_DIR, path}, cwd)).to
        .emitSequence([nodePath.join(outdir, path)]);
  });

  should('return based on project root if root type is PROJECT_ROOT', async () => {
    const projectRoot = '/a';
    _.fakeProcess.setCwd('/a/b/c');

    _.fakeFs.addFile(
        nodePath.join(projectRoot, ROOT_FILE_NAME),
        {content: JSON.stringify({outdir: '/'})},
    );

    const path = 'path';
    const cwd = 'cwd';
    await asyncAssert(resolveFileRef(_.vine, {rootType: BuiltInRootType.PROJECT_ROOT, path}, cwd))
        .to.emitSequence([
          nodePath.join(projectRoot, path),
        ]);
  });

  should('return based on system root if root type is SYSTEM_ROOT', async () => {
    const path = 'path';
    const cwd = 'cwd';
    await asyncAssert(resolveFileRef(_.vine, {rootType: BuiltInRootType.SYSTEM_ROOT, path}, cwd))
        .to.emitSequence([
          nodePath.join('/', path),
        ]);
  });

  should('throw error if root type is PROJECT_ROOT but no project root is found', async () => {
    const path = 'path';
    const cwd = 'cwd';
    await asyncAssert(resolveFileRef(_.vine, {rootType: BuiltInRootType.PROJECT_ROOT, path}, cwd))
        .to.emitErrorWithMessage(/Cannot find project root/);
  });
});

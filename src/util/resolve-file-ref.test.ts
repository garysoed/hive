import { assert, should, test } from 'gs-testing';
import * as nodePath from 'path';

import { BuiltInRootType } from '../core/root-type';
import { ROOT_FILE_NAME } from '../project/find-root';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { resolveFileRef } from './resolve-file-ref';


test('@hive/util/resolve-file-ref', init => {
  init(() => {
    mockFs();
    mockProcess();
    return {};
  });

  should(`return based on cwd if root type is CURRENT_DIR`, () => {
    const cwd = 'cwd';
    setCwd(cwd);

    const path = 'path';
    assert(resolveFileRef({rootType: BuiltInRootType.CURRENT_DIR, path}, cwd)).to.emitSequence([
      nodePath.join(cwd, path),
    ]);
  });

  should(`return based on the out dir if root type is OUT_DIR`, () => {
    setCwd('/a/b/c');

    const outdir = '/outdir';
    addFile(nodePath.join('/a', ROOT_FILE_NAME), {content: JSON.stringify({outdir})});

    const path = 'path';
    const cwd = 'cwd';
    assert(resolveFileRef({rootType: BuiltInRootType.OUT_DIR, path}, cwd)).to.emitSequence([
      nodePath.join(outdir, path),
    ]);
  });

  should(`return based on project root if root type is PROJECT_ROOT`, () => {
    const projectRoot = '/a';
    setCwd('/a/b/c');

    addFile(nodePath.join(projectRoot, ROOT_FILE_NAME), {content: JSON.stringify({outdir: '/'})});

    const path = 'path';
    const cwd = 'cwd';
    assert(resolveFileRef({rootType: BuiltInRootType.PROJECT_ROOT, path}, cwd)).to.emitSequence([
      nodePath.join(projectRoot, path),
    ]);
  });

  should(`return based on system root if root type is SYSTEM_ROOT`, () => {
    const path = 'path';
    const cwd = 'cwd';
    assert(resolveFileRef({rootType: BuiltInRootType.SYSTEM_ROOT, path}, cwd)).to.emitSequence([
      nodePath.join('/', path),
    ]);
  });

  should(`throw error if root type is PROJECT_ROOT but no project root is found`, () => {
    const path = 'path';
    const cwd = 'cwd';
    assert(resolveFileRef({rootType: BuiltInRootType.PROJECT_ROOT, path}, cwd)).to
        .emitErrorWithMessage(/Cannot find project root/);
  });
});

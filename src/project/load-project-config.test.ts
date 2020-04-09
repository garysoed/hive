import { assert, objectThat, should, test } from 'gs-testing';
import * as path from 'path';

import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { ROOT_FILE_NAME } from './find-root';
import { loadProjectConfig } from './load-project-config';
import { ProjectConfig } from './project-config';


test('@hive/project/load-project-config', init => {
  init(() => {
    mockFs();
    mockProcess();
    return {};
  });

  should(`load the project config correctly`, () => {
    setCwd('/a/b/c');

    const dir = 'dir';
    const content = JSON.stringify({outdir: dir});
    addFile(path.join('/a', ROOT_FILE_NAME), {content});

    assert(loadProjectConfig()).to.emitSequence([
      objectThat<ProjectConfig>().haveProperties({
        outdir: dir,
      }),
    ]);
  });

  should(`emit error if root folder was not found`, () => {
    setCwd('/a/b/c');

    assert(loadProjectConfig()).to.emitErrorWithMessage(/No root folder/);
  });
});

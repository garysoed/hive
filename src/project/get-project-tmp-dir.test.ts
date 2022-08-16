import * as path from 'path';


import {Vine} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {FakeFs} from 'gs-testing/export/fake';

import {$fs} from '../external/fs';
import {mockProcess, setCwd} from '../testing/fake-process';

import {ROOT_FILE_NAME} from './find-root';
import {getProjectTmpDir, TMP_DIR_NAME} from './get-project-tmp-dir';


test('@hive/project/get-project-tmp-dir', init => {
  const _ = init(() => {
    const fakeFs = new FakeFs();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $fs, withValue: fakeFs},
      ],
    });
    mockProcess();
    return {fakeFs, vine};
  });

  should('emit the correct path', () => {
    const root = '/path/to/root';
    const content = `
    globals:
    outdir: out/
    `;
    _.fakeFs.addFile(path.join(root, ROOT_FILE_NAME), {content});
    setCwd(root);

    assert(getProjectTmpDir(_.vine)).to.emitSequence([path.join(root, TMP_DIR_NAME)]);
  });

  should('emit null if root is not found', () => {
    assert(getProjectTmpDir(_.vine)).to.emitSequence([null]);
  });
});

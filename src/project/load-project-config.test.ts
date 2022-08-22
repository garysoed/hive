import * as path from 'path';

import {Vine} from 'grapevine';
import {assert, objectThat, should, test, setup} from 'gs-testing';
import {FakeFs, FakeProcess} from 'gs-testing/export/fake';

import {$fs} from '../external/fs';
import {$process} from '../external/process';

import {ROOT_FILE_NAME} from './find-root';
import {loadProjectConfig} from './load-project-config';
import {ProjectConfig} from './project-config';


test('@hive/project/load-project-config', () => {
  const _ = setup(() => {
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

  should('load the project config correctly', () => {
    _.fakeProcess.setCwd('/a/b/c');

    const dir = 'dir';
    const content = JSON.stringify({outdir: dir});
    _.fakeFs.addFile(path.join('/a', ROOT_FILE_NAME), {content});

    assert(loadProjectConfig(_.vine)).to.emitSequence([
      objectThat<ProjectConfig>().haveProperties({
        outdir: dir,
      }),
    ]);
  });

  should('emit error if root folder was not found', () => {
    _.fakeProcess.setCwd('/a/b/c');

    assert(loadProjectConfig(_.vine)).to.emitErrorWithMessage(/No root folder/);
  });
});

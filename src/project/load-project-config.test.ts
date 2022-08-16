import * as path from 'path';

import {Vine} from 'grapevine';
import {assert, objectThat, should, test} from 'gs-testing';
import {FakeFs} from 'gs-testing/export/fake';

import {$fs} from '../external/fs';
import {mockProcess, setCwd} from '../testing/fake-process';

import {ROOT_FILE_NAME} from './find-root';
import {loadProjectConfig} from './load-project-config';
import {ProjectConfig} from './project-config';


test('@hive/project/load-project-config', init => {
  const _ =init(() => {
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

  should('load the project config correctly', () => {
    setCwd('/a/b/c');

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
    setCwd('/a/b/c');

    assert(loadProjectConfig(_.vine)).to.emitErrorWithMessage(/No root folder/);
  });
});

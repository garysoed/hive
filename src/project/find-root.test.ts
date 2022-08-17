import * as path from 'path';

import {Vine} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {FakeFs, FakeProcess} from 'gs-testing/export/fake';

import {$fs} from '../external/fs';
import {$process} from '../external/process';

import {findRoot, ROOT_FILE_NAME} from './find-root';


test('@hive/project/find-root', init => {
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

  should('return the correct project root', () => {
    _.fakeProcess.setCwd('/a/cwd');

    _.fakeFs.addFile(path.join('/a', ROOT_FILE_NAME), {content: ''});

    assert(findRoot(_.vine)).to.emitSequence(['/a']);
  });

  should('handle current directory', () => {
    _.fakeProcess.setCwd('/a');

    _.fakeFs.addFile(path.join('/a', ROOT_FILE_NAME), {content: ''});

    assert(findRoot(_.vine)).to.emitSequence(['/a']);
  });

  should('return the inner project root if two exists', () => {
    _.fakeProcess.setCwd('/a/cwd');

    _.fakeFs.addFile(path.join('/a/cwd', ROOT_FILE_NAME), {content: ''});
    _.fakeFs.addFile(path.join('/a', ROOT_FILE_NAME), {content: ''});

    assert(findRoot(_.vine)).to.emitSequence(['/a/cwd']);
  });

  should('return null if there are no project roots', () => {
    _.fakeProcess.setCwd('/a/cwd');

    assert(findRoot(_.vine)).to.emitSequence([null]);
  });
});

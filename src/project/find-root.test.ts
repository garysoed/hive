import * as path from 'path';

import { assert, setup, should, test } from '@gs-testing';

import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { FILE_NAME, findRoot } from './find-root';

test('@hive/project/find-root', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  should(`return the correct project root`, () => {
    setCwd('/a/cwd');

    addFile(path.join('/a', FILE_NAME), {content: ''});

    assert(findRoot()).to.emitSequence(['/a']);
  });

  should(`handle current directory`, () => {
    setCwd('/a');

    addFile(path.join('/a', FILE_NAME), {content: ''});

    assert(findRoot()).to.emitSequence(['/a']);
  });

  should(`return the inner project root if two exists`, () => {
    setCwd('/a/cwd');

    addFile(path.join('/a/cwd', FILE_NAME), {content: ''});
    addFile(path.join('/a', FILE_NAME), {content: ''});

    assert(findRoot()).to.emitSequence(['/a/cwd']);
  });

  should(`return null if there are no project roots`, () => {
    setCwd('/a/cwd');

    assert(findRoot()).to.emitSequence([null]);
  });
});

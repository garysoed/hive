import { assert, setup, should, test } from '@gs-testing';

import { addFile, mockFs, getWatcherSubject } from '../testing/fake-fs';

import { readFile } from './read-file';
import { ReplaySubject } from 'rxjs';

test('@hive/util/read-file', () => {
  setup(() => {
    mockFs();
  });

  should(`emit the file content`, () => {
    const path = 'path';
    const content = 'content';

    addFile(path, {content});

    assert(readFile(path)).to.emitSequence([content]);
  });

  should(`emit the file content on changes`, () => {
    const path = 'path';
    const content = 'content';

    addFile(path, {content});

    const content$ = new ReplaySubject<string>(2);
    readFile(path).subscribe(content$);

    // Change the content
    const content2 = 'content2';
    addFile(path, {content: content2});

    getWatcherSubject(path).next();

    assert(content$).to.emitSequence([content, content2]);
  });

  should(`emit error on error`, () => {
    assert(readFile('path')).to.emitErrorWithMessage(/not found/);
  });
});

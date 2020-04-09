import { assert, should, test } from 'gs-testing';
import { ReplaySubject } from 'rxjs';

import { addFile, getWatcherSubject, mockFs } from '../testing/fake-fs';

import { readFile } from './read-file';


test('@hive/util/read-file', init => {
  init(() => {
    mockFs();
    return {};
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

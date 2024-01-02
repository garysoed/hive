import {Vine} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {FakeFs} from 'gs-testing/export/fake';
import {ReplaySubject} from 'rxjs';

import {$fs} from '../external/fs';

import {readFile} from './read-file';


test('@hive/util/read-file', () => {
  const _ = setup(() => {
    const fakeFs = new FakeFs();
    const vine = new Vine({
      overrides: [
        {override: $fs, withValue: fakeFs},
      ],
    });
    return {fakeFs, vine};
  });

  should('emit the file content', async () => {
    const path = 'path';
    const content = 'content';

    _.fakeFs.addFile(path, {content});

    await asyncAssert(readFile(_.vine, path)).to.emitSequence([content]);
  });

  should('emit the file content on changes', async () => {
    const path = 'path';
    const content = 'content';

    _.fakeFs.addFile(path, {content});

    const content$ = new ReplaySubject<string>(2);
    readFile(_.vine, path).subscribe(content$);

    // Change the content
    const content2 = 'content2';
    _.fakeFs.addFile(path, {content: content2});

    _.fakeFs.simulateChange(path);

    await asyncAssert(content$).to.emitSequence([content, content2]);
  });

  should('emit error on error', async () => {
    await asyncAssert(readFile(_.vine, 'path')).to.emitErrorWithMessage(/not found/);
  });
});

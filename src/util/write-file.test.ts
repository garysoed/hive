import {Vine} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {FakeFs} from 'gs-testing/export/fake';

import {$fs} from '../external/fs';

import {writeFile} from './write-file';


test('@hive/util/write-file', init => {
  const _ = init(() => {
    const fakeFs = new FakeFs();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $fs, withValue: fakeFs},
      ],
    });
    return {fakeFs, vine};
  });

  should('write the file correctly', () => {
    const dir = 'dir';
    const path = `${dir}/path`;
    const content = 'content';

    writeFile(_.vine, path, content).subscribe();

    assert(_.fakeFs.getFile(path)!.content).to.equal(content);
    assert(_.fakeFs.hasDir(dir)).to.beTrue();
  });
});

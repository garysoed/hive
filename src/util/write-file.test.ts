import { assert, setup, should, test } from '@gs-testing';

import { getFile, hasDir, mockFs } from '../testing/fake-fs';

import { writeFile } from './write-file';


test('@hive/util/write-file', () => {
  setup(() => {
    mockFs();
  });

  should(`write the file correctly`, () => {
    const dir = 'dir';
    const path = `${dir}/path`;
    const content = 'content';

    writeFile(path, content).subscribe();

    assert(getFile(path)!.content).to.equal(content);
    assert(hasDir(dir)).to.beTrue();
  });
});

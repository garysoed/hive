import { assert, setup, should, test } from '@gs-testing';
import { filterNonNull } from '@gs-tools/rxjs';
import { map } from '@rxjs/operators';

import { getFile, mockFs } from '../testing/fake-fs';

import { writeFile } from './write-file';


test('@hive/util/write-file', () => {
  setup(() => {
    mockFs();
  });

  should(`write the file correctly`, () => {
    const path = 'path';
    const content = 'content';

    writeFile(path, content).subscribe();

    assert(getFile(path).pipe(filterNonNull(), map(file => file.content))).to
        .emitSequence([content]);
  });
});

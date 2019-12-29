import { assert, objectThat, should, test } from '@gs-testing';

import { BuiltInRootType } from '../../core/root-type';

import { parseGlobRef } from './parse-glob-ref';

test('@hive/config/parse/parse-glob-ref', () => {
  should(`parse correctly`, () => {
    assert(parseGlobRef('@out/glob/path/*.txt')).to
        .equal(objectThat().haveProperties({
          rootType: BuiltInRootType.OUT_DIR,
          globPattern: 'glob/path/*.txt',
        }));
  });

  should(`throw error if value is missing`, () => {
    assert(() => parseGlobRef('')).to.throwErrorWithMessage(/is empty/);
  });

  should(`handle white spaces`, () => {
    assert(parseGlobRef('@out/glob/path/*.txt\n   ')).to
        .equal(objectThat().haveProperties({
          rootType: BuiltInRootType.OUT_DIR,
          globPattern: 'glob/path/*.txt',
      }));
  });
});

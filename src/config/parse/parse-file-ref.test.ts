import {assert, objectThat, should, test} from 'gs-testing';

import {FileRef} from '../../core/file-ref';
import {BuiltInRootType} from '../../core/root-type';

import {parseFileRef} from './parse-file-ref';

test('@hive/config/parse/parse-file-ref', () => {
  should('parse project root based path correctly', () => {
    assert(parseFileRef('@root/path/to/file.txt')).to
        .equal(objectThat<FileRef>().haveProperties({
          rootType: BuiltInRootType.PROJECT_ROOT,
          path: 'path/to/file.txt',
        }));
  });

  should('parse output directory based path correctly', () => {
    assert(parseFileRef('@out/path/to/file.txt')).to
        .equal(objectThat<FileRef>().haveProperties({
          rootType: BuiltInRootType.OUT_DIR,
          path: 'path/to/file.txt',
        }));
  });

  should('parse custom directory based path correctly', () => {
    assert(parseFileRef('@custom/path/to/file.txt')).to
        .equal(objectThat<FileRef>().haveProperties({
          rootType: 'custom',
          path: 'path/to/file.txt',
        }));
  });

  should('parse system root based path correctly', () => {
    assert(parseFileRef('/path/to/file.txt')).to
        .equal(objectThat<FileRef>().haveProperties({
          rootType: BuiltInRootType.SYSTEM_ROOT,
          path: 'path/to/file.txt',
        }));
  });

  should('parse current directory based path correctly', () => {
    assert(parseFileRef('./path/to/file.txt')).to
        .equal(objectThat<FileRef>().haveProperties({
          rootType: BuiltInRootType.CURRENT_DIR,
          path: './path/to/file.txt',
        }));
  });

  should('parse current directory based path correctly, if it refers to parent directory', () => {
    assert(parseFileRef('../path/to/file.txt')).to
        .equal(objectThat<FileRef>().haveProperties({
          rootType: BuiltInRootType.CURRENT_DIR,
          path: '../path/to/file.txt',
        }));
  });
});

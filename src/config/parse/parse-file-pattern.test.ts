import {assert, objectThat, setThat, should, test} from 'gs-testing';

import {FilePattern} from '../../core/file-pattern';
import {BuiltInRootType} from '../../core/root-type';

import {parseFilePattern} from './parse-file-pattern';

test('@hive/config/parse/parse-file-pattern', () => {
  should('handle correct file patterns', () => {
    const raw = '/file/pattern/{input1}_{input2}';
    assert(parseFilePattern(raw)).to
        .equal(objectThat<FilePattern>().haveProperties({
          rootType: BuiltInRootType.SYSTEM_ROOT,
          pattern: 'file/pattern/{input1}_{input2}',
          substitutionKeys: setThat<string>().haveExactElements(new Set(['input1', 'input2'])),
        }));
  });

  should('handle white spaces', () => {
    const raw = '/file/pattern/{input1}_{input2}\n   ';
    assert(parseFilePattern(raw)).to
        .equal(objectThat<FilePattern>().haveProperties({
          rootType: BuiltInRootType.SYSTEM_ROOT,
          pattern: 'file/pattern/{input1}_{input2}',
          substitutionKeys: setThat<string>().haveExactElements(new Set(['input1', 'input2'])),
        }));
  });
});

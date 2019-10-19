import { assert, match, setup, should, test } from '@gs-testing';
import { NumberType } from '@gs-types';

import { LoadRule } from '../core/load-rule';
import { RootType } from '../core/root-type';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { readRule } from './read-rule';

test('@hive/util/read-rule', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  should(`return the correct rule`, () => {
    const content = `
      rule:
          load: !!hive/file out:filename
          as: !!hive/o_type number
    `;

    setCwd('cwd');
    addFile('cwd/a/b', {content});

    assert(readRule({path: 'a/b', rootType: RootType.CURRENT_DIR, ruleName: 'rule'})).to
        .emitSequence([
          match.anyObjectThat<LoadRule>().haveProperties({
            name: 'rule',
            srcs: match.anyObjectThat().haveProperties({
              path: 'filename',
              rootType: RootType.OUT_DIR,
            }),
            type: match.anyObjectThat().haveProperties({
              baseType: NumberType,
              isArray: false,
            }),
          }),
        ]);
  });

  should(`throw if the rule cannot be found`, () => {
    const content = `
      rule:
          load: !!hive/file out:filename
          as: !!hive/o_type number
    `;

    setCwd('cwd');
    addFile('cwd/a/b', {content});

    assert(readRule({path: 'a/b', rootType: RootType.CURRENT_DIR, ruleName: 'otherRule'})).to
        .emitErrorWithMessage(/Cannot find rule/);
  });
});

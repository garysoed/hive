import * as path from 'path';

import { arrayThat, assert, objectThat, setup, should, test } from '@gs-testing';

import { LoadRule } from '../core/load-rule';
import { BuiltInRootType } from '../core/root-type';
import { ConstType } from '../core/type/const-type';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { readRule, RULE_FILE_NAME } from './read-rule';


test('@hive/util/read-rule', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  should(`return the correct rule`, () => {
    const content = `
      hive.load({
        name: 'rule',
        srcs: ['@out/filename'],
        outputType: 'number',
      });
    `;

    setCwd('cwd');
    addFile(path.join('cwd/a/b', RULE_FILE_NAME), {content});

    assert(readRule({path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: 'rule'})).to
        .emitSequence([
          objectThat<LoadRule>().haveProperties({
            name: 'rule',
            srcs: arrayThat().haveExactElements([
              objectThat().haveProperties({
                path: 'filename',
                rootType: BuiltInRootType.OUT_DIR,
              }),
            ]),
            outputType: objectThat().haveProperties({
              baseType: ConstType.NUMBER,
              isArray: false,
            }),
          }),
        ]);
  });

  should(`throw if the rule cannot be found`, () => {
    const content = `
      hive.load({
        name: 'rule',
        srcs: ['@out/filename'],
        outputType: 'number',
      });
    `;

    setCwd('cwd');
    addFile(path.join('cwd/a/b', RULE_FILE_NAME), {content});

    assert(readRule({path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: 'otherRule'})).to
        .emitErrorWithMessage(/Cannot find rule/);
  });
});

import { anyThat, arrayThat, assert, objectThat, should, test } from 'gs-testing';
import * as path from 'path';

import { Serializer } from '../config/serializer/serializer';
import { FileRef } from '../core/file-ref';
import { LoadRule } from '../core/load-rule';
import { BuiltInRootType } from '../core/root-type';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { readRule, RULE_FILE_NAME, RuleWithPath } from './read-rule';


test('@hive/util/read-rule', init => {
  init(() => {
    mockFs();
    mockProcess();
    return {};
  });

  should(`emit the correct rule`, () => {
    const content = `
      load({
        name: 'rule',
        srcs: ['@out/filename'],
        output: as.number,
      });
    `;

    const cwd = 'cwd';
    setCwd(cwd);
    addFile(path.join(cwd, 'a/b', RULE_FILE_NAME), {content});

    const result$ = readRule(
        {path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: 'rule'},
        cwd,
    );
    assert(result$).to
        .emitSequence([
          objectThat<RuleWithPath>().haveProperties({
            rule: objectThat<LoadRule>().haveProperties({
              name: 'rule',
              srcs: arrayThat<FileRef>().haveExactElements([
                objectThat<FileRef>().haveProperties({
                  path: 'filename',
                  rootType: BuiltInRootType.OUT_DIR,
                }),
              ]),
              output: anyThat<Serializer<number>>().passPredicate(
                  loader => loader.desc === 'number',
                  'a number loader',
              ),
            }),
            path: path.join(cwd, 'a/b'),
          }),
        ]);
  });

  should(`throw if the rule cannot be found`, () => {
    const content = `
      load({
        name: 'rule',
        srcs: ['@out/filename'],
        output: as.number,
      });
    `;

    const cwd = 'cwd';
    setCwd(cwd);
    addFile(path.join(cwd, 'a/b', RULE_FILE_NAME), {content});

    const result$ = readRule(
        {path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: 'otherRule'},
        cwd,
    );

    assert(result$).to.emitErrorWithMessage(/Cannot find rule/);
  });
});

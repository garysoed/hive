import { anyThat, arrayThat, assert, objectThat, should, test } from 'gs-testing';
import * as path from 'path';

import { Serializer } from '../config/serializer/serializer';
import { LoadRule } from '../core/load-rule';
import { BuiltInRootType } from '../core/root-type';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { readRule, RULE_FILE_NAME, RuleWithPath } from './read-rule';
import { readRules, RulesWithPath } from './read-rules';


test('@hive/util/read-rule', init => {
  init(() => {
    mockFs();
    mockProcess();
    return {};
  });

  should(`emit rule with matching name`, () => {
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

    const result$ = readRules(
        {path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: 'rule'},
        cwd,
    );
    assert(result$).to
        .emitSequence([
          objectThat<RulesWithPath>().haveProperties({
            rules: arrayThat<LoadRule>().haveExactElements([
              objectThat<LoadRule>().haveProperties({
                name: 'rule',
                srcs: arrayThat().haveExactElements([
                  objectThat().haveProperties({
                    path: 'filename',
                    rootType: BuiltInRootType.OUT_DIR,
                  }),
                ]),
                output: anyThat<Serializer<unknown>>().passPredicate(
                    loader => loader.desc === 'number',
                    'a number loader',
                ),
              }),
            ]),
            path: path.join(cwd, 'a/b'),
          }),
        ]);
  });

  should(`emit all the rules in the file`, () => {
    const content = `
      load({
        name: 'rule1',
        srcs: ['@out/filename'],
        output: as.number,
      });

      load({
        name: 'rule2',
        srcs: ['@out/filename'],
        output: as.number,
      });
    `;

    const cwd = 'cwd';
    setCwd(cwd);
    addFile(path.join(cwd, 'a/b', RULE_FILE_NAME), {content});

    const result$ = readRules(
        {path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: '*'},
        cwd,
    );
    assert(result$).to
        .emitSequence([
          objectThat<RulesWithPath>().haveProperties({
            rules: arrayThat<LoadRule>().haveExactElements([
              objectThat<LoadRule>().haveProperties({
                name: 'rule1',
                srcs: arrayThat().haveExactElements([
                  objectThat().haveProperties({
                    path: 'filename',
                    rootType: BuiltInRootType.OUT_DIR,
                  }),
                ]),
                output: anyThat<Serializer<unknown>>().passPredicate(
                    loader => loader.desc === 'number',
                    'a number loader',
                ),
              }),
              objectThat<LoadRule>().haveProperties({
                name: 'rule2',
                srcs: arrayThat().haveExactElements([
                  objectThat().haveProperties({
                    path: 'filename',
                    rootType: BuiltInRootType.OUT_DIR,
                  }),
                ]),
                output: anyThat<Serializer<unknown>>().passPredicate(
                    loader => loader.desc === 'number',
                    'a number loader',
                ),
              }),
            ]),
            path: path.join(cwd, 'a/b'),
          }),
        ]);
  });

  should(`throw if the file is empty`, () => {
    const content = ``;

    const cwd = 'cwd';
    setCwd(cwd);
    addFile(path.join(cwd, 'a/b', RULE_FILE_NAME), {content});

    const result$ = readRules(
        {path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: 'otherRule'},
        cwd,
    );

    assert(result$).to.emitErrorWithMessage(/Cannot find rules/);
  });
});

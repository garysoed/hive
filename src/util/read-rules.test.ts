import * as path from 'path';

import {Vine} from 'grapevine';
import {anyThat, arrayThat, assert, objectThat, should, test, setup} from 'gs-testing';
import {FakeFs, FakeProcess} from 'gs-testing/export/fake';

import {Serializer} from '../config/serializer/serializer';
import {FileRef} from '../core/file-ref';
import {LoadRule} from '../core/load-rule';
import {BuiltInRootType} from '../core/root-type';
import {$fs} from '../external/fs';

import {RULE_FILE_NAME} from './read-rule';
import {readRules, RulesWithPath} from './read-rules';


test('@hive/util/read-rule', () => {
  const _ = setup(() => {
    const fakeFs = new FakeFs();
    const fakeProcess = new FakeProcess();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $fs, withValue: fakeFs},
      ],
    });
    return {fakeFs, fakeProcess, vine};
  });

  should('emit rule with matching name', () => {
    const content = `
      load({
        name: 'rule',
        srcs: ['@out/filename'],
        output: as.number,
      });
    `;

    const cwd = 'cwd';
    _.fakeProcess.setCwd(cwd);
    _.fakeFs.addFile(path.join(cwd, 'a/b', RULE_FILE_NAME), {content});

    const result$ = readRules(
        _.vine,
        {path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: 'rule'},
        cwd,
    );
    assert(result$).to
        .emitSequence([
          objectThat<RulesWithPath>().haveProperties({
            rules: arrayThat<LoadRule>().haveExactElements([
              objectThat<LoadRule>().haveProperties({
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
            ]),
            path: path.join(cwd, 'a/b'),
          }),
        ]);
  });

  should('emit all the rules in the file', () => {
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
    _.fakeProcess.setCwd(cwd);
    _.fakeFs.addFile(path.join(cwd, 'a/b', RULE_FILE_NAME), {content});

    const result$ = readRules(
        _.vine,
        {path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: '*'},
        cwd,
    );
    assert(result$).to
        .emitSequence([
          objectThat<RulesWithPath>().haveProperties({
            rules: arrayThat<LoadRule>().haveExactElements([
              objectThat<LoadRule>().haveProperties({
                name: 'rule1',
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
              objectThat<LoadRule>().haveProperties({
                name: 'rule2',
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
            ]),
            path: path.join(cwd, 'a/b'),
          }),
        ]);
  });

  should('throw if the file is empty', () => {
    const content = '';

    const cwd = 'cwd';
    _.fakeProcess.setCwd(cwd);
    _.fakeFs.addFile(path.join(cwd, 'a/b', RULE_FILE_NAME), {content});

    const result$ = readRules(
        _.vine,
        {path: 'a/b', rootType: BuiltInRootType.CURRENT_DIR, ruleName: 'otherRule'},
        cwd,
    );

    assert(result$).to.emitErrorWithMessage(/Cannot find rules/);
  });
});

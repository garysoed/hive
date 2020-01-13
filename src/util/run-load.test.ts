import { arrayThat, assert, setup, should, test } from '@gs-testing';
import { stringType } from '@gs-types';
import { of as observableOf } from '@rxjs';

import { fromType } from '../config/loader';
import { LoadRule } from '../core/load-rule';
import { BuiltInRootType } from '../core/root-type';
import { RuleType } from '../core/rule-type';
import { addFile, mockFs } from '../testing/fake-fs';
import { addGlobHandler, mockGlob } from '../testing/fake-glob';

import { runRule } from './run-rule';


test('@hive/util/run-load', () => {
  setup(() => {
    mockFs();
    mockGlob();
  });

  should(`emit content of file if file ref was given`, () => {
    const content = 'content';
    addFile('/a/b/c.txt', {content});

    const rule: LoadRule = {
      name: 'loadRule',
      srcs: [{rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a/b/c.txt'}],
      type: RuleType.LOAD,
      output: fromType(stringType),
    };

    assert(runRule(rule)).to.emitSequence([arrayThat<string>().haveExactElements([content])]);
  });

  should(`emit content of all matching files if glob ref was given`, () => {
    const contentC = 'contentC';
    addFile('/a/b/c.txt', {content: contentC});

    const contentD = 'contentD';
    addFile('/a/b/d.txt', {content: contentD});

    const contentE = 'contentE';
    addFile('/a/b/e.txt', {content: contentE});

    addGlobHandler('a/b/*.txt', '/', observableOf(['/a/b/c.txt', '/a/b/d.txt', '/a/b/e.txt']));

    const rule: LoadRule = {
      name: 'loadRule',
      srcs: [{rootType: BuiltInRootType.SYSTEM_ROOT, globPattern: 'a/b/*.txt'}],
      type: RuleType.LOAD,
      output: fromType(stringType),
    };

    assert(runRule(rule)).to.emitSequence([
      arrayThat<string>().haveExactElements([contentC, contentD, contentE]),
    ]);
  });
});

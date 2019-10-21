import { assert, match, setup, should, test } from '@gs-testing';
import { of as observableOf } from '@rxjs';

import { LoadRule } from '../core/load-rule';
import { RootType } from '../core/root-type';
import { RuleType } from '../core/rule-type';
import { ConstType } from '../core/type/const-type';
import { addFile, mockFs } from '../testing/fake-fs';
import { addGlobHandler, mockGlob } from '../testing/fake-glob';

import { runLoad } from './run-load';


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
      srcs: {rootType: RootType.SYSTEM_ROOT, path: 'a/b/c.txt'},
      type: RuleType.LOAD,
      outputType: {isArray: false, baseType: ConstType.STRING},
    };

    assert(runLoad(rule)).to.emitSequence([content]);
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
      srcs: {rootType: RootType.SYSTEM_ROOT, globPattern: 'a/b/*.txt'},
      type: RuleType.LOAD,
      outputType: {isArray: false, baseType: ConstType.STRING},
    };

    assert(runLoad(rule)).to.emitSequence([
      match.anyArrayThat<string>().haveExactElements([contentC, contentD, contentE]),
    ]);
  });
});
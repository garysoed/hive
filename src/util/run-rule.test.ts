import * as path from 'path';

import { arrayThat, assert, mapThat, setup, should, test } from '@gs-testing';
import { of as observableOf } from '@rxjs';
import { map } from '@rxjs/operators';

import { DeclareRule } from '../core/declare-rule';
import { LoadRule } from '../core/load-rule';
import { RenderRule } from '../core/render-rule';
import { BuiltInRootType } from '../core/root-type';
import { RuleType } from '../core/rule-type';
import { ConstType } from '../core/type/const-type';
import { ROOT_FILE_NAME } from '../project/find-root';
import { addFile, mockFs } from '../testing/fake-fs';
import { addGlobHandler, mockGlob } from '../testing/fake-glob';
import { mockProcess } from '../testing/fake-process';

import { RULE_FILE_NAME } from './read-rule';
import { runRule } from './run-rule';


test('@hive/util/run-rule', () => {
  setup(() => {
    mockFs();
    mockProcess();
    mockGlob();
  });

  should(`run load rules correctly`, () => {
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
      outputType: {isArray: false, baseType: ConstType.STRING},
    };

    assert(runRule(rule)).to.emitSequence([
      arrayThat<string>().haveExactElements([contentC, contentD, contentE]),
    ]);
  });

  should(`run declare rules correctly`, () => {
    const configContent = JSON.stringify({outdir: 'out'});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    // tslint:disable-next-line: no-invalid-template-strings
    const content = '`${$hive.a + $hive.b}`';
    addFile('/a/b.js', {content});

    const rule: DeclareRule = {
      type: RuleType.DECLARE,
      name: 'testRule',
      inputs: new Map([
        ['a', {isArray: false, matcher: /number/}],
        ['b', {isArray: false, matcher: /number/}],
      ]),
      output: {isArray: false, baseType: ConstType.NUMBER},
      processor: {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a/b.js'},
    };

    assert(runRule(rule).pipe(map(fn => fn(new Map([['a', 1], ['b', 2]])))))
        .to.emitSequence(['3']);
  });

  should(`run render rules correctly`, () => {
    const configContent = JSON.stringify({outdir: '/out'});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    const declarationContent = `
    hive.declare({
      name: 'declareRule',
      processor: '/src/processors/plus.js',
      inputs: {
        a: 'number',
        b: 'number',
      },
      output: 'number',
    });
    `;
    addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

    const processorContent = `$hive.a + $hive.b`;
    addFile('/src/processors/plus.js', {content: processorContent});

    const rule: RenderRule = {
      name: 'renderRule',
      inputs: new Map([
        ['a', [0, 1, 2]],
        ['b', [0, 3]],
      ]),
      processor: {
        ruleName: 'declareRule',
        rootType: BuiltInRootType.SYSTEM_ROOT,
        path: 'src/declarations',
      },
      output: {
        rootType: BuiltInRootType.OUT_DIR,
        pattern: '{a}_{b}.txt',
        substitutionKeys: new Set(['a', 'b']),
      },
      type: RuleType.RENDER,
    };

    assert(runRule(rule)).to.emitSequence([
      mapThat<string, number>().haveExactElements(new Map([
        ['/out/0_0.txt', 0],
        ['/out/0_3.txt', 3],
        ['/out/1_0.txt', 1],
        ['/out/1_3.txt', 4],
        ['/out/2_0.txt', 2],
        ['/out/2_3.txt', 5],
      ])),
    ]);
  });
});

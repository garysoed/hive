import * as path from 'path';

import {Vine} from 'grapevine';
import {arrayThat, assert, mapThat, should, test, setup} from 'gs-testing';
import {FakeFs, FakeGlobFactory} from 'gs-testing/export/fake';
import {numberType, stringType} from 'gs-types';
import {BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';

import {fromType} from '../config/serializer/serializer';
import {DeclareRule} from '../core/declare-rule';
import {LoadRule} from '../core/load-rule';
import {RenderRule} from '../core/render-rule';
import {BuiltInRootType} from '../core/root-type';
import {RuleType} from '../core/rule-type';
import {$fs} from '../external/fs';
import {$glob} from '../external/glob';
import {ROOT_FILE_NAME} from '../project/find-root';


import {RULE_FILE_NAME} from './read-rule';
import {runRule} from './run-rule';


test('@hive/util/run-rule', () => {
  const _ = setup(() => {
    const fakeFs = new FakeFs();
    const fakeGlobFactory = new FakeGlobFactory();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $fs, withValue: fakeFs},
        {override: $glob, withValue: fakeGlobFactory.glob.bind(fakeGlobFactory)},
      ],
    });
    return {fakeFs, fakeGlobFactory, vine};
  });

  should('run load rules correctly', () => {
    const contentC = 'contentC';
    _.fakeFs.addFile('/a/b/c.txt', {content: contentC});

    const contentD = 'contentD';
    _.fakeFs.addFile('/a/b/d.txt', {content: contentD});

    const contentE = 'contentE';
    _.fakeFs.addFile('/a/b/e.txt', {content: contentE});

    _.fakeGlobFactory.setGlobHandler(
        'a/b/*.txt',
        '/',
        new BehaviorSubject(['/a/b/c.txt', '/a/b/d.txt', '/a/b/e.txt']),
    );

    const rule: LoadRule = {
      name: 'loadRule',
      srcs: [{rootType: BuiltInRootType.SYSTEM_ROOT, globPattern: 'a/b/*.txt'}],
      type: RuleType.LOAD,
      output: fromType(stringType),
    };

    const cwd = 'cwd';
    assert(runRule(_.vine, rule, cwd)).to.emitSequence([
      arrayThat<string>().haveExactElements([contentC, contentD, contentE]),
    ]);
  });

  should('run declare rules correctly', () => {
    const configContent = JSON.stringify({outdir: 'out'});
    _.fakeFs.addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    // tslint:disable-next-line: no-invalid-template-strings
    const content = 'output(a + b)';
    _.fakeFs.addFile('/a/b.js', {content});

    const rule: DeclareRule = {
      type: RuleType.DECLARE,
      name: 'testRule',
      output: fromType(numberType),
      inputs: new Map([
        ['a', numberType],
        ['b', numberType],
      ]),
      processor: {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a/b.js'},
    };

    const cwd = 'cwd';
    assert(runRule(_.vine, rule, cwd).pipe(map(({fn}) => fn(_.vine, new Map([['a', 1], ['b', 2]])))))
        .to.emitSequence([3]);
  });

  should('run render rules correctly', () => {
    const configContent = JSON.stringify({outdir: '/out'});
    _.fakeFs.addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    const declarationContent = `
    declare({
      name: 'declareRule',
      processor: '/src/processors/plus.js',
      inputs: {
        a: type.number,
        b: type.number,
      },
      output: as.number,
    });
    `;
    _.fakeFs.addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

    const processorContent = 'output(a + b)';
    _.fakeFs.addFile('/src/processors/plus.js', {content: processorContent});

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

    const cwd = 'cwd';
    assert(runRule(_.vine, rule, cwd)).to.emitSequence([
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

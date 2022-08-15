import * as path from 'path';

import {assert, mapThat, should, test} from 'gs-testing';
import {ReplaySubject} from 'rxjs';

import {RenderRule} from '../core/render-rule';
import {BuiltInRootType} from '../core/root-type';
import {RuleType} from '../core/rule-type';
import {ROOT_FILE_NAME} from '../project/find-root';
import {addFile, getFile, getWatcherSubject, mockFs} from '../testing/fake-fs';

import {RULE_FILE_NAME} from './read-rule';
import {runRule} from './run-rule';


test('@hive/util/run-render', init => {
  init(() => {
    mockFs();
    return {};
  });

  should('emit map of file names to their content', () => {
    const configContent = JSON.stringify({outdir: '/out', globals: {a: 10, g: 4}});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    const declarationContent = `
    declare({
      name: 'declareRule',
      processor: '/src/processors/plus.js',
      inputs: {
        a: type.number,
        b: type.number,
        g: type.number,
      },
      output: as.number,
    });
    `;
    addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

    const processorContent = 'output(a + b + g)';
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

    const cwd = 'cwd';
    assert(runRule(rule, cwd)).to.emitSequence([
      mapThat<string, number>().haveExactElements(new Map([
        ['/out/0_0.txt', 4],
        ['/out/0_3.txt', 7],
        ['/out/1_0.txt', 5],
        ['/out/1_3.txt', 8],
        ['/out/2_0.txt', 6],
        ['/out/2_3.txt', 9],
      ])),
    ]);
    assert(getFile('/out/0_0.txt')!.content).to.equal('4');
    assert(getFile('/out/0_3.txt')!.content).to.equal('7');
    assert(getFile('/out/1_0.txt')!.content).to.equal('5');
    assert(getFile('/out/1_3.txt')!.content).to.equal('8');
    assert(getFile('/out/2_0.txt')!.content).to.equal('6');
    assert(getFile('/out/2_3.txt')!.content).to.equal('9');
  });

  should('handle processing results that are Promises', async () => {
    const configContent = JSON.stringify({outdir: '/out'});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

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
    addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

    const processorContent = 'output(Promise.resolve(a + b))';
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

    const cwd = 'cwd';
    const resultsMap$ = runRule(rule, cwd);
    assert(resultsMap$).to.emitWith(mapThat<string, unknown>().haveExactElements(new Map(
        [
          ['/out/0_0.txt', 0],
          ['/out/0_3.txt', 3],
          ['/out/1_0.txt', 1],
          ['/out/1_3.txt', 4],
          ['/out/2_0.txt', 2],
          ['/out/2_3.txt', 5],
        ],
    )));

    assert(getFile('/out/0_0.txt')!.content).to.equal('0');
    assert(getFile('/out/0_3.txt')!.content).to.equal('3');
    assert(getFile('/out/1_0.txt')!.content).to.equal('1');
    assert(getFile('/out/1_3.txt')!.content).to.equal('4');
    assert(getFile('/out/2_0.txt')!.content).to.equal('2');
    assert(getFile('/out/2_3.txt')!.content).to.equal('5');
  });

  should('handle processing results that are Objects', async () => {
    const configContent = JSON.stringify({outdir: '/out'});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    const declarationContent = `
    declare({
      name: 'declareRule',
      processor: '/src/processors/plus.js',
      inputs: {
        a: type.number,
        b: type.number,
      },
      output: as.object,
    });
    `;
    addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

    const processorContent = 'output({result: a + b})';
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

    const cwd = 'cwd';
    const resultsMap$ = runRule(rule, cwd);
    assert(resultsMap$).to.emitWith(mapThat<string, unknown>().haveExactElements(new Map(
        [
          ['/out/0_0.txt', 0],
          ['/out/0_3.txt', 3],
          ['/out/1_0.txt', 1],
          ['/out/1_3.txt', 4],
          ['/out/2_0.txt', 2],
          ['/out/2_3.txt', 5],
        ],
    )));

    assert(getFile('/out/0_0.txt')!.content).to.equal(JSON.stringify({result: 0}));
    assert(getFile('/out/0_3.txt')!.content).to.equal(JSON.stringify({result: 3}));
    assert(getFile('/out/1_0.txt')!.content).to.equal(JSON.stringify({result: 1}));
    assert(getFile('/out/1_3.txt')!.content).to.equal(JSON.stringify({result: 4}));
    assert(getFile('/out/2_0.txt')!.content).to.equal(JSON.stringify({result: 2}));
    assert(getFile('/out/2_3.txt')!.content).to.equal(JSON.stringify({result: 5}));
  });

  should('emit error if the processor is not a declare rule', () => {
    const configContent = JSON.stringify({outdir: '/out'});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    const declarationContent = `
    load({
      name: 'declareRule',
      srcs: ['/src/processors/plus.js'],
      output: as.number,
    });
    `;
    addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

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
        rootType: BuiltInRootType.SYSTEM_ROOT,
        pattern: '{a}_{b}.txt',
        substitutionKeys: new Set(['a', 'b']),
      },
      type: RuleType.RENDER,
    };

    const cwd = 'cwd';
    assert(runRule(rule, cwd)).to.emitErrorWithMessage(/should be a declare rule/);
  });

  should('continue processing if the processor throws', () => {
    const configContent = JSON.stringify({outdir: '/out', globals: {}});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    const declarationContent = `
    declare({
      name: 'declareRule',
      processor: '/src/processors/error.js',
      inputs: {
        a: type.number,
      },
      output: as.number,
    });
    `;
    addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

    const processorContent = 'throw new Error(a);';
    addFile('/src/processors/error.js', {content: processorContent});

    const rule: RenderRule = {
      name: 'renderRule',
      inputs: new Map([
        ['a', 1],
      ]),
      processor: {
        ruleName: 'declareRule',
        rootType: BuiltInRootType.SYSTEM_ROOT,
        path: 'src/declarations',
      },
      output: {
        rootType: BuiltInRootType.OUT_DIR,
        pattern: 'out.txt',
        substitutionKeys: new Set(),
      },
      type: RuleType.RENDER,
    };

    const output$ = new ReplaySubject(2);
    const cwd = 'cwd';
    runRule(rule, cwd).subscribe(output$);

    addFile('/src/processors/error.js', {content: 'output(2)'});
    getWatcherSubject('/src/processors/error.js').next();

    assert(output$).to.emitSequence([
      mapThat<string, number>().haveExactElements(new Map([
        ['/out/out.txt', 2],
      ])),
    ]);
  });
});

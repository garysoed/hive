import * as path from 'path';

import { assert, createSpy, mapThat, setup, should, test } from '@gs-testing';
import { Observable } from '@rxjs';
import { take } from '@rxjs/operators';

import { RenderRule } from '../core/render-rule';
import { RootType } from '../core/root-type';
import { RuleType } from '../core/rule-type';
import { ROOT_FILE_NAME } from '../project/find-root';
import { addFile, getFile, mockFs } from '../testing/fake-fs';

import { RULE_FILE_NAME } from './read-rule';
import { runRender } from './run-render';


test('@hive/util/run-render', () => {
  setup(() => {
    mockFs();
  });

  should(`emit map of file names to their content`, () => {
    const configContent = JSON.stringify({outdir: '/out', globals: {g: 4}});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    const declarationContent = `
    declareRule:
        declare: !!hive/file /:src/processors/plus.js
        inputs:
            a: !!hive/i_type number
            b: !!hive/i_type number
        output: !!hive/o_type number
    `;
    addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

    const processorContent = `$hive.a + $hive.b + $hiveGlobals.g`;
    addFile('/src/processors/plus.js', {content: processorContent});

    const rule: RenderRule = {
      name: 'renderRule',
      inputs: new Map([
        ['a', [0, 1, 2]],
        ['b', [0, 3]],
      ]),
      processor: {
        ruleName: 'declareRule',
        rootType: RootType.SYSTEM_ROOT,
        path: 'src/declarations',
      },
      output: {
        rootType: RootType.OUT_DIR,
        pattern: '{a}_{b}.txt',
        substitutionKeys: new Set(['a', 'b']),
      },
      type: RuleType.RENDER,
    };

    const mockResolveRuleFn = createSpy<Observable<ReadonlyMap<string, string>>, [RenderRule]>(
        'ResolveRuleFn');

    assert(runRender(rule, mockResolveRuleFn as any)).to.emitSequence([
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

  should(`handle processing results that are Promises`, async () => {
    const configContent = JSON.stringify({outdir: '/out'});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    const declarationContent = `
    declareRule:
        declare: !!hive/file /:src/processors/plus.js
        inputs:
            a: !!hive/i_type number
            b: !!hive/i_type number
        output: !!hive/o_type number
    `;
    addFile(path.join('/src/declarations', RULE_FILE_NAME), {content: declarationContent});

    const processorContent = `Promise.resolve($hive.a + $hive.b)`;
    addFile('/src/processors/plus.js', {content: processorContent});

    const rule: RenderRule = {
      name: 'renderRule',
      inputs: new Map([
        ['a', [0, 1, 2]],
        ['b', [0, 3]],
      ]),
      processor: {
        ruleName: 'declareRule',
        rootType: RootType.SYSTEM_ROOT,
        path: 'src/declarations',
      },
      output: {
        rootType: RootType.OUT_DIR,
        pattern: '{a}_{b}.txt',
        substitutionKeys: new Set(['a', 'b']),
      },
      type: RuleType.RENDER,
    };

    const mockResolveRuleFn = createSpy<Observable<ReadonlyMap<string, string>>, [RenderRule]>(
        'ResolveRuleFn');

    const resultsMap = await runRender(rule, mockResolveRuleFn as any).pipe(take(1)).toPromise();

    assert(await (resultsMap.get('/out/0_0.txt') as Promise<number>)).to.equal(0);
    assert(await (resultsMap.get('/out/0_3.txt') as Promise<number>)).to.equal(3);
    assert(await (resultsMap.get('/out/1_0.txt') as Promise<number>)).to.equal(1);
    assert(await (resultsMap.get('/out/1_3.txt') as Promise<number>)).to.equal(4);
    assert(await (resultsMap.get('/out/2_0.txt') as Promise<number>)).to.equal(2);
    assert(await (resultsMap.get('/out/2_3.txt') as Promise<number>)).to.equal(5);

    assert(getFile('/out/0_0.txt')!.content).to.equal('0');
    assert(getFile('/out/0_3.txt')!.content).to.equal('3');
    assert(getFile('/out/1_0.txt')!.content).to.equal('1');
    assert(getFile('/out/1_3.txt')!.content).to.equal('4');
    assert(getFile('/out/2_0.txt')!.content).to.equal('2');
    assert(getFile('/out/2_3.txt')!.content).to.equal('5');
  });

  should(`emit error if the processor is not a declare rule`, () => {
    const declarationContent = `
    declareRule:
        load: !!hive/file /:src/processors/plus.js
        as: !!hive/o_type number
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
        rootType: RootType.SYSTEM_ROOT,
        path: 'src/declarations',
      },
      output: {
        rootType: RootType.SYSTEM_ROOT,
        pattern: '{a}_{b}.txt',
        substitutionKeys: new Set(['a', 'b']),
      },
      type: RuleType.RENDER,
    };

    const mockResolveRuleFn = createSpy<Observable<ReadonlyMap<string, string>>, [RenderRule]>('ResolveRuleFn');

    assert(runRender(rule, mockResolveRuleFn as any)).to.emitErrorWithMessage(/should be a declare rule/);
  });
});

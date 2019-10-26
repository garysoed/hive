import * as path from 'path';

import { assert, createSpy, match, setup, should, test } from '@gs-testing';
import { Observable } from '@rxjs';

import { DeclareRule } from '../core/declare-rule';
import { RenderRule } from '../core/render-rule';
import { RootType } from '../core/root-type';
import { Rule } from '../core/rule';
import { RuleType } from '../core/rule-type';
import { ROOT_FILE_NAME } from '../project/find-root';
import { addFile, mockFs } from '../testing/fake-fs';

import { RULE_FILE_NAME } from './read-rule';
import { runRender } from './run-render';

test('@hive/util/run-render', () => {
  setup(() => {
    mockFs();
  });

  should(`emit map of file names to their content`, () => {
    const configContent = `
    outdir: /out
    `;
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

    const mockResolveRuleFn = createSpy<Observable<ReadonlyMap<string, string>>, [RenderRule]>('ResolveRuleFn');

    assert(runRender(rule, mockResolveRuleFn as any)).to.emitSequence([
      match.anyMapThat<string, string>().haveExactElements(new Map([
        ['/out/0_0.txt', '0'],
        ['/out/0_3.txt', '3'],
        ['/out/1_0.txt', '1'],
        ['/out/1_3.txt', '4'],
        ['/out/2_0.txt', '2'],
        ['/out/2_3.txt', '5'],
      ])),
    ]);
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

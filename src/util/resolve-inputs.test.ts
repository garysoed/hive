import * as path from 'path';

import { assert, createSpy, fake, match, setup, should, Spy, test } from '@gs-testing';
import { Observable, of as observableOf } from '@rxjs';

import { LoadRule } from '../core/load-rule';
import { RenderInput } from '../core/render-input';
import { RootType } from '../core/root-type';
import { Rule } from '../core/rule';
import { addFile, mockFs } from '../testing/fake-fs';

import { RULE_FILE_NAME } from './read-rule';
import { resolveInputs } from './resolve-inputs';


test('@hive/util/resolve-inputs', () => {
  let mockResolveRule: Spy<Observable<unknown>, [Rule]>;

  setup(() => {
    mockFs();
    mockResolveRule = createSpy('ResolveRule');
  });

  should(`resolve non rule reference inputs correctly`, () => {
    const inputs = new Map<string, RenderInput>([['a', 1], ['b', 'two']]);

    assert(resolveInputs(inputs, mockResolveRule)).to.emitSequence([
      match.anyMapThat<string, unknown>().haveExactElements(new Map<string, unknown>([
        ['a', 1],
        ['b', 'two'],
      ])),
    ]);
  });

  should(`resolve rule reference inputs correctly`, () => {
    fake(mockResolveRule).always().call(rule => {
      return observableOf((rule as LoadRule).outputType.baseType);
    });

    const contentA = `
    ruleA:
        load: !!hive/file /:file.txt
        as: !!hive/o_type number
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const contentB = `
    ruleB:
        load: !!hive/file /:file.txt
        as: !!hive/o_type string
    `;
    addFile(path.join('/b', RULE_FILE_NAME), {content: contentB});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: RootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
      ['b', {rootType: RootType.SYSTEM_ROOT, path: 'b', ruleName: 'ruleB'}],
    ]);

    assert(resolveInputs(inputs, mockResolveRule)).to.emitSequence([
      match.anyMapThat<string, unknown>().haveExactElements(new Map<string, unknown>([
        ['a', 'number'],
        ['b', 'string'],
      ])),
    ]);
  });
});

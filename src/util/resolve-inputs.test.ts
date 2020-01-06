import * as path from 'path';

import { arrayThat, assert, createSpy, fake, mapThat, setup, should, Spy, test } from '@gs-testing';
import { Observable, of as observableOf } from '@rxjs';

import { DeclareRule } from '../core/declare-rule';
import { LoadRule } from '../core/load-rule';
import { Processor } from '../core/processor';
import { RenderInput, ResolvedRenderInput } from '../core/render-input';
import { RenderRule } from '../core/render-rule';
import { BuiltInRootType } from '../core/root-type';
import { Rule } from '../core/rule';
import { ConstType } from '../core/type/const-type';
import { addFile, mockFs } from '../testing/fake-fs';

import { RULE_FILE_NAME } from './read-rule';
import { resolveInputs } from './resolve-inputs';


test('@hive/util/resolve-inputs', () => {
  let mockResolveRule: Spy<Observable<unknown>, [Rule]>;

  function fakeRunRule(renderRule: RenderRule): Observable<ReadonlyMap<string, string>>;
  function fakeRunRule(declareRule: DeclareRule): Observable<Processor>;
  function fakeRunRule(loadRule: LoadRule): Observable<string[]>;
  function fakeRunRule(rule: Rule): Observable<unknown> {
    return mockResolveRule(rule);
  }

  setup(() => {
    mockFs();
    mockResolveRule = createSpy('ResolveRule');
  });

  should(`resolve non rule reference inputs correctly`, () => {
    const inputs = new Map<string, RenderInput>([['a', 1], ['b', 'two']]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(new Map<string, ResolvedRenderInput>([
        ['a', 1],
        ['b', 'two'],
      ])),
    ]);
  });

  should(`resolve single file load rule reference inputs correctly`, () => {
    fake(mockResolveRule).always().call(rule => {
      const loadRule = rule as LoadRule;
      switch (loadRule.output.baseType) {
        case ConstType.NUMBER:
          return observableOf(['123']);
        case ConstType.STRING:
          return observableOf(['randomString']);
        default:
          throw new Error('Unsupported');
      }
    });

    const contentA = `
    load({
      name: 'ruleA',
      srcs: ['/file.txt'],
      output: 'number',
    });
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const contentB = `
    load({
      name: 'ruleB',
      srcs: ['/file.txt'],
      output: 'string',
    });
    `;
    addFile(path.join('/b', RULE_FILE_NAME), {content: contentB});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
      ['b', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'b', ruleName: 'ruleB'}],
    ]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(new Map<string, ResolvedRenderInput>([
        ['a', 123],
        ['b', 'randomString'],
      ])),
    ]);
  });

  should(`emit error if the output is not an array but the sources has multiple contents`, () => {
    fake(mockResolveRule).always().call(rule => {
      const loadRule = rule as LoadRule;
      switch (loadRule.output.baseType) {
        case ConstType.NUMBER:
          return observableOf(['123', '234']);
        default:
          throw new Error('Unsupported');
      }
    });

    const contentA = `
    load({
      name: 'ruleA',
      srcs: ['/file.txt'],
      output: 'number',
    });
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitErrorWithMessage(/non array output/);
  });

  should(`resolve glob file load rule reference inputs correctly`, () => {
    fake(mockResolveRule).always().call(rule => {
      return observableOf(['123', '456']);
    });

    const contentA = `
    load({
      name: 'ruleA',
      srcs: [glob('/*.txt')],
      output: 'number[]',
    });
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(new Map<string, ResolvedRenderInput>([
        ['a', arrayThat().haveExactElements([123, 456])],
      ])),
    ]);
  });

  should(`resolve declare rule reference inputs correctly`, () => {
    const fn = () => undefined;
    fake(mockResolveRule).always().call(rule => {
      return observableOf(fn);
    });

    const contentA = `
    declare({
      name: 'ruleA',
      processor: '/file.txt',
      inputs: {},
      output: 'number',
    });
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(new Map<string, ResolvedRenderInput>([
        ['a', fn],
      ])),
    ]);
  });

  should(`resolve render rule reference inputs correctly`, () => {
    fake(mockResolveRule).always().call(rule => {
      return observableOf(new Map([['file1', 'content1'], ['file2', 'content2']]));
    });

    const contentA = `
    render({
      name: 'ruleA',
      processor: '/path:rule',
      inputs: {},
      output: '/file.txt',
    });
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(new Map<string, ResolvedRenderInput>([
        ['a', arrayThat().haveExactElements(['content1', 'content2'])],
      ])),
    ]);
  });
});

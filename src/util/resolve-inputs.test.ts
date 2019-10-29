import * as path from 'path';

import { assert, createSpy, fake, match, setup, should, Spy, test } from '@gs-testing';
import { Observable, of as observableOf } from '@rxjs';

import { DeclareRule } from '../core/declare-rule';
import { LoadRule } from '../core/load-rule';
import { RenderInput } from '../core/render-input';
import { RenderRule } from '../core/render-rule';
import { RootType } from '../core/root-type';
import { Rule } from '../core/rule';
import { ConstType } from '../core/type/const-type';
import { addFile, mockFs } from '../testing/fake-fs';

import { RULE_FILE_NAME } from './read-rule';
import { resolveInputs } from './resolve-inputs';
import { DeclareFn } from './run-declare';


test('@hive/util/resolve-inputs', () => {
  let mockResolveRule: Spy<Observable<unknown>, [Rule]>;

  function fakeRunRule(renderRule: RenderRule): Observable<ReadonlyMap<string, string>>;
  function fakeRunRule(declareRule: DeclareRule): Observable<DeclareFn>;
  function fakeRunRule(loadRule: LoadRule): Observable<string|string[]>;
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
      match.anyMapThat<string, unknown>().haveExactElements(new Map<string, unknown>([
        ['a', 1],
        ['b', 'two'],
      ])),
    ]);
  });

  should(`resolve single file load rule reference inputs correctly`, () => {
    fake(mockResolveRule).always().call(rule => {
      const loadRule = rule as LoadRule;
      switch (loadRule.outputType.baseType) {
        case ConstType.NUMBER:
          return observableOf('123');
        case ConstType.STRING:
          return observableOf('randomString');
        default:
          throw new Error('Unsupported');
      }
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

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      match.anyMapThat<string, unknown>().haveExactElements(new Map<string, unknown>([
        ['a', 123],
        ['b', 'randomString'],
      ])),
    ]);
  });

  should(`resolve glob file load rule reference inputs correctly`, () => {
    fake(mockResolveRule).always().call(rule => {
      return observableOf(['123', '456']);
    });

    const contentA = `
    ruleA:
        load: !!hive/glob /:*.txt
        as: !!hive/o_type number
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: RootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      match.anyMapThat<string, unknown>().haveExactElements(new Map<string, unknown>([
        ['a', match.anyArrayThat().haveExactElements([123, 456])],
      ])),
    ]);
  });

  should(`resolve declare rule reference inputs correctly`, () => {
    const fn = () => undefined;
    fake(mockResolveRule).always().call(rule => {
      return observableOf(fn);
    });

    const contentA = `
    ruleA:
        declare: !!hive/file /:file.txt
        inputs:
        output: !!hive/o_type number
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: RootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      match.anyMapThat<string, unknown>().haveExactElements(new Map<string, unknown>([
        ['a', fn],
      ])),
    ]);
  });

  should(`resolve render rule reference inputs correctly`, () => {
    fake(mockResolveRule).always().call(rule => {
      return observableOf(new Map([['file1', 'content1'], ['file2', 'content2']]));
    });

    const contentA = `
    ruleA:
        render: !!hive/pattern /:file.txt
        inputs:
        processor: !!hive/rule /:path:rule
    `;
    addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: RootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    assert(resolveInputs(inputs, fakeRunRule)).to.emitSequence([
      match.anyMapThat<string, unknown>().haveExactElements(new Map<string, unknown>([
        ['a', match.anyArrayThat().haveExactElements(['content1', 'content2'])],
      ])),
    ]);
  });
});

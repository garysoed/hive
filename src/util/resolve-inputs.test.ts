import * as path from 'path';

import {Vine} from 'grapevine';
import {arrayThat, assert, createSpy, fake, mapThat, should, test, setup} from 'gs-testing';
import {FakeFs} from 'gs-testing/export/fake';
import {Observable, of} from 'rxjs';

import {DeclareRule} from '../core/declare-rule';
import {LoadRule} from '../core/load-rule';
import {Processor} from '../core/processor';
import {RenderInput, ResolvedRenderInput} from '../core/render-input';
import {RenderRule} from '../core/render-rule';
import {BuiltInRootType} from '../core/root-type';
import {Rule} from '../core/rule';
import {$fs} from '../external/fs';

import {RULE_FILE_NAME} from './read-rule';
import {resolveInputs} from './resolve-inputs';


test('@hive/util/resolve-inputs', () => {
  function fakeRunRule(vine: Vine, renderRule: RenderRule): Observable<ReadonlyMap<string, string>>;
  function fakeRunRule(vine: Vine, declareRule: DeclareRule): Observable<Processor>;
  function fakeRunRule(vine: Vine, loadRule: LoadRule): Observable<string[]>;
  function fakeRunRule(vine: Vine, rule: Rule): Observable<unknown> {
    return _.mockResolveRule(rule);
  }

  const _ = setup(() => {
    const fakeFs = new FakeFs();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $fs, withValue: fakeFs},
      ],
    });
    const mockResolveRule = createSpy<Observable<unknown>, [Rule]>('ResolveRule');
    return {fakeFs, mockResolveRule, vine};
  });

  should('resolve non rule reference inputs correctly', () => {
    const inputs = new Map<string, RenderInput>([['a', 1], ['b', 'two']]);

    const cwd = 'cwd';
    assert(resolveInputs(_.vine, inputs, fakeRunRule, cwd)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(
          new Map<string, ResolvedRenderInput>([
            ['a', 1],
            ['b', 'two'],
          ])),
    ]);
  });

  should('resolve single file load rule reference inputs correctly', () => {
    fake(_.mockResolveRule).always().call(rule => {
      const loadRule = rule as LoadRule;
      switch (loadRule.output.desc) {
        case 'number':
          return of(['123']);
        case 'string':
          return of(['randomString']);
        default:
          throw new Error('Unsupported');
      }
    });

    const contentA = `
    load({
      name: 'ruleA',
      srcs: ['/file.txt'],
      output: as.number,
    });
    `;
    _.fakeFs.addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const contentB = `
    load({
      name: 'ruleB',
      srcs: ['/file.txt'],
      output: as.string,
    });
    `;
    _.fakeFs.addFile(path.join('/b', RULE_FILE_NAME), {content: contentB});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
      ['b', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'b', ruleName: 'ruleB'}],
    ]);

    const cwd = 'cwd';
    assert(resolveInputs(_.vine, inputs, fakeRunRule, cwd)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(
          new Map<string, ResolvedRenderInput>([
            ['a', 123],
            ['b', 'randomString'],
          ])),
    ]);
  });

  should('emit error if the output is not an array but the sources has multiple contents', () => {
    fake(_.mockResolveRule).always().call(() => of(['123', '234']));

    const contentA = `
    load({
      name: 'ruleA',
      srcs: ['/file.txt'],
      output: as.number,
    });
    `;
    _.fakeFs.addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    const cwd = 'cwd';
    assert(resolveInputs(_.vine, inputs, fakeRunRule, cwd)).to.emitErrorWithMessage(/non array output/);
  });

  should('resolve glob file load rule reference inputs correctly', () => {
    fake(_.mockResolveRule).always().call(() => {
      return of(['123', '456']);
    });

    const contentA = `
    load({
      name: 'ruleA',
      srcs: [glob('/*.txt')],
      output: as.numberArray,
    });
    `;
    _.fakeFs.addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    const cwd = 'cwd';
    assert(resolveInputs(_.vine, inputs, fakeRunRule, cwd)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(
          new Map<string, ResolvedRenderInput>([
            ['a', arrayThat().haveExactElements([123, 456])],
          ])),
    ]);
  });

  should('resolve declare rule reference inputs correctly', () => {
    const fn = (): undefined => undefined;
    fake(_.mockResolveRule).always().call(() => {
      return of(fn);
    });

    const contentA = `
    declare({
      name: 'ruleA',
      processor: '/file.txt',
      inputs: {},
      output: as.number,
    });
    `;
    _.fakeFs.addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    const cwd = 'cwd';
    assert(resolveInputs(_.vine, inputs, fakeRunRule, cwd)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(
          new Map<string, ResolvedRenderInput>([
            ['a', fn],
          ])),
    ]);
  });

  should('resolve render rule reference inputs correctly', () => {
    fake(_.mockResolveRule).always().call(() => {
      return of(new Map([['file1', 'content1'], ['file2', 'content2']]));
    });

    const contentA = `
    render({
      name: 'ruleA',
      processor: '/path:rule',
      inputs: {},
      output: '/file.txt',
    });
    `;
    _.fakeFs.addFile(path.join('/a', RULE_FILE_NAME), {content: contentA});

    const inputs = new Map<string, RenderInput>([
      ['a', {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a', ruleName: 'ruleA'}],
    ]);

    const cwd = 'cwd';
    assert(resolveInputs(_.vine, inputs, fakeRunRule, cwd)).to.emitSequence([
      mapThat<string, ResolvedRenderInput>().haveExactElements(
          new Map<string, ResolvedRenderInput>([
            ['a', arrayThat().haveExactElements(['content1', 'content2'])],
          ])),
    ]);
  });
});

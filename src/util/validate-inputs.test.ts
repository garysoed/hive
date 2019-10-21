import * as path from 'path';

import { assert, match, setup, should, test } from '@gs-testing';

import { RenderInput } from '../core/render-input';
import { RootType } from '../core/root-type';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess } from '../testing/fake-process';

import { RULE_FILE_NAME } from './read-rule';
import { validateInputs } from './validate-inputs';


test('@hive/util/validate-inputs', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  test('validateInputs', () => {
    should(`emit keys that should be repeated`, () => {
      const actual = new Map([
        ['a', [1, 2, 3]],
        ['b', ['a', 'b']],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /number/}],
        ['b', {isArray: false, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitSequence([
        match.anySetThat<string>().haveExactElements(new Set(['a', 'b'])),
      ]);
    });

    should(`include empty array inputs as repeated keys`, () => {
      const actual = new Map([
        ['a', []],
        ['b', []],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /number/}],
        ['b', {isArray: false, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitSequence([
        match.anySetThat<string>().haveExactElements(new Set(['a', 'b'])),
      ]);
    });

    should(`not add inputs that are the matching type`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', 1],
        ['b', 'abc'],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /number/}],
        ['b', {isArray: false, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitSequence([
        match.anySetThat<string>().beEmpty(),
      ]);
    });

    should(`not throw if the array type matches the expected type`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', [1, 2, 3]],
        ['b', ['a', 'b']],
      ]);
      const expected = new Map([
        ['a', {isArray: true, matcher: /number/}],
        ['b', {isArray: true, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitSequence([
        match.anySetThat<string>().beEmpty(),
      ]);
    });

    should(`match empty array to input with array expected type`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', []],
        ['b', []],
      ]);
      const expected = new Map([
        ['a', {isArray: true, matcher: /number/}],
        ['b', {isArray: true, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitSequence([
        match.anySetThat<string>().beEmpty(),
      ]);
    });

    should(`emit error if the non array type is incompatible`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', 'abc'],
        ['b', 'abc'],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /number/}],
        ['b', {isArray: false, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitErrorWithMessage(/is incompatible/);
    });

    should(`emit error if the element type of an array is incompatible`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', ['abc']],
        ['b', ['abc']],
      ]);
      const expected = new Map([
        ['a', {isArray: true, matcher: /number/}],
        ['b', {isArray: true, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitErrorWithMessage(/is incompatible/);
    });

    should(`emit error if expecting an array but non array is given`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', 12],
        ['b', 'abc'],
      ]);
      const expected = new Map([
        ['a', {isArray: true, matcher: /number/}],
        ['b', {isArray: true, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitErrorWithMessage(/is incompatible/);
    });

    should(`emit error if a key is missing`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', 12],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /number/}],
        ['b', {isArray: false, matcher: /string/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitErrorWithMessage(/Missing value/);
    });

    should(`handle empty inputs`, () => {
      const actual = new Map();
      const expected = new Map();

      assert(validateInputs(actual, expected)).to
          .emitSequence([match.anySetThat<string>().beEmpty()]);
    });
  });

  test('isBaseTypeCompatible', () => {
    should(`handle simple types`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', 1],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /number/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitSequence([
        match.anySetThat<string>().beEmpty(),
      ]);
    });

    should(`throw error if simple types do not match`, () => {
      const actual = new Map<string, RenderInput>([
        ['a', 'abc'],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /number/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitErrorWithMessage(/is incompatible/);
    });

    should(`handle MediaTypes`, () => {
      const content = `
      loadRule:
          load: !!hive/file .:file.txt
          as: !!hive/o_type text/plain
      `;
      addFile(path.join('/a', RULE_FILE_NAME), {content});

      const actual = new Map<string, RenderInput>([
        ['a', {rootType: RootType.SYSTEM_ROOT, path: 'a', ruleName: 'loadRule'}],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /text\/.*/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitSequence([
        match.anySetThat<string>().beEmpty(),
      ]);
    });

    should(`throw error if MediaTypes do not match`, () => {
      const content = `
      loadRule:
          load: !!hive/file .:file.txt
          as: !!hive/o_type text/plain
      `;
      addFile(path.join('/a', RULE_FILE_NAME), {content});

      const actual = new Map<string, RenderInput>([
        ['a', {rootType: RootType.SYSTEM_ROOT, path: 'a', ruleName: 'loadRule'}],
      ]);
      const expected = new Map([
        ['a', {isArray: false, matcher: /image\/.*/}],
      ]);

      assert(validateInputs(actual, expected)).to.emitErrorWithMessage(/is incompatible/);
    });
  });
});
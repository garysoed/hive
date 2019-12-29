import { arrayThat, assert, mapThat, objectThat, should, test } from '@gs-testing';

import { RenderInput } from '../core/render-input';
import { BuiltInRootType } from '../core/root-type';

import { parseRender } from './parse-render';


test('@hive/config/parse-render', () => {
  test('parseRender', () => {

  });

  test('isInputObject', () => {
    should(`handle valid input objects`, () => {
      const inputs = {inputA: 1, inputB: 'two'};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });


      assert(renderRule).to.equal(
          objectThat().haveProperties({
            inputs: mapThat().haveExactElements(new Map<string, RenderInput>([
              ['inputA', 1],
              ['inputB', 'two'],
            ])),
          }),
      );
    });

    should(`handle invalid input objects`, () => {
      const inputs = {inputA: 1, inputB: undefined};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });

      assert(renderRule).to.beNull();
    });
  });

  test('isRenderInput', () => {
    should(`handle file ref`, () => {
      const inputs = {input: {rootType: BuiltInRootType.OUT_DIR, path: 'path'}};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });

      assert(renderRule).to.equal(
          objectThat().haveProperties({
            inputs: mapThat().haveExactElements(new Map([
              [
                'input',
                objectThat().haveProperties({
                  rootType: BuiltInRootType.OUT_DIR,
                  path: 'path',
                }),
              ],
            ])),
          }),
      );
    });

    should(`handle rule ref`, () => {
      const inputs = {input: {rootType: BuiltInRootType.OUT_DIR, path: 'path', ruleName: 'rule'}};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });

      assert(renderRule).to.equal(
          objectThat().haveProperties({
            inputs: mapThat().haveExactElements(new Map([
              [
                'input',
                objectThat().haveProperties({
                  rootType: BuiltInRootType.OUT_DIR,
                  path: 'path',
                  ruleName: 'rule',
                }),
              ],
            ])),
          }),
      );
    });

    should(`handle array with correct element type`, () => {
      const inputs = {input: [1]};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });

      assert(renderRule).to.equal(
          objectThat().haveProperties({
            inputs: mapThat().haveExactElements(new Map([
              ['input', arrayThat().haveExactElements([1])],
            ])),
          }),
      );
    });

    should(`handle empty arrays`, () => {
      const inputs = {input: []};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });

      assert(renderRule).to.equal(
          objectThat().haveProperties({
            inputs: mapThat().haveExactElements(new Map([
              ['input', arrayThat().beEmpty()],
            ])),
          }),
      );
    });

    should(`reject array with incorrect element type`, () => {
      const inputs = {input: [undefined]};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });

      assert(renderRule).to.beNull();
    });

    should(`handle simple type`, () => {
      const inputs = {input: 'abc'};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });

      assert(renderRule).to.equal(
          objectThat().haveProperties({
            inputs: mapThat().haveExactElements(new Map([
              ['input', 'abc'],
            ])),
          }),
      );
    });

    should(`handle unsupported simple types`, () => {
      const inputs = {input: undefined};

      const renderRule = parseRender(
          'ruleName',
          {
            inputs,
            processor: {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'},
            render: {rootType: BuiltInRootType.SYSTEM_ROOT, pattern: 'path', substitutionKeys: new Set()},
          });

      assert(renderRule).to.beNull();
    });
  });
});

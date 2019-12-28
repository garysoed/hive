import { arrayThat, assert, mapThat, objectThat, should, test } from '@gs-testing';

import { RenderInput } from '../core/render-input';
import { BuiltInRootType } from '../core/root-type';

import { parseRender } from './parse-render';


test('@hive/config/parse-render', () => {
  test('parseRender', () => {
    should(`return correct render object`, () => {
      const ruleName = 'ruleName';
      const processor = {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'};
      const inputs = {inputA: 1, inputB: 'two'};
      const render = {
        rootType: BuiltInRootType.SYSTEM_ROOT,
        pattern: 'path/to/{out}',
        substitutionKeys: new Set(['out']),
      };

      const renderRule = parseRender(ruleName, {inputs, processor, render});

      assert(renderRule).to.equal(objectThat().haveProperties({
        name: ruleName,
        processor,
        inputs: mapThat().haveExactElements(new Map<string, RenderInput>([
          ['inputA', 1],
          ['inputB', 'two'],
        ])),
        output: render,
      }));
    });

    should(`return null if input object is invalid`, () => {
      const ruleName = 'ruleName';
      const processor = {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'};
      const inputs = {input: undefined};
      const render = {
        rootType: BuiltInRootType.SYSTEM_ROOT,
        pattern: 'path/to/{out}',
        substitutionKeys: new Set(['out']),
      };

      const renderRule = parseRender(ruleName, {inputs, processor, render});

      assert(renderRule).to.beNull();
    });

    should(`handle empty inputs`, () => {
      const ruleName = 'ruleName';
      const processor = {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'};
      const render = {
        rootType: BuiltInRootType.SYSTEM_ROOT,
        pattern: 'path/to/{out}',
        substitutionKeys: new Set(['out']),
      };

      const renderRule = parseRender(ruleName, {inputs: null, processor, render});

      assert(renderRule).to.equal(objectThat().haveProperties({
        name: ruleName,
        processor,
        inputs: mapThat().beEmpty(),
        output: render,
      }));
    });

    should(`return null if the inputs is not an object`, () => {
      const ruleName = 'ruleName';
      const processor = {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'};
      const inputs = 123;
      const render = {
        rootType: BuiltInRootType.SYSTEM_ROOT,
        pattern: 'path/to/{out}',
        substitutionKeys: new Set(['out']),
      };

      const renderRule = parseRender(ruleName, {inputs, processor, render});

      assert(renderRule).to.beNull();
    });

    should(`return null if processor is an invalid rule ref`, () => {
      const ruleName = 'ruleName';
      const processor = {};
      const inputs = {inputA: 1, inputB: 'two'};
      const render = {
        rootType: BuiltInRootType.SYSTEM_ROOT,
        pattern: 'path/to/{out}',
        substitutionKeys: new Set(['out']),
      };

      const renderRule = parseRender(ruleName, {inputs, processor, render});

      assert(renderRule).to.beNull();
    });

    should(`return null if render is an invalid file pattern`, () => {
      const ruleName = 'ruleName';
      const processor = {rootType: BuiltInRootType.OUT_DIR, path: 'path/to/rule', ruleName: 'rule'};
      const inputs = {inputA: 1, inputB: 'two'};
      const render = {};

      const renderRule = parseRender(ruleName, {inputs, processor, render});

      assert(renderRule).to.beNull();
    });
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

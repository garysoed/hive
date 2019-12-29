import { assert, objectThat, setup, should, test } from '@gs-testing';

import { BuiltInRootType } from '../core/root-type';
import { ConstType } from '../core/type/const-type';
import { OutputType } from '../core/type/output-type';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess } from '../testing/fake-process';

import { getTypeOfValue } from './get-type-of-value';


test('@hive/util/get-type-of-value', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  should(`emit the correct type for functions`, () => {
    assert(getTypeOfValue(() => 123)).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.FUNCTION,
      }),
    ]);
  });

  should(`emit the correct type for objects`, () => {
    assert(getTypeOfValue({})).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.OBJECT,
      }),
    ]);
  });

  should(`emit the correct type of strings`, () => {
    assert(getTypeOfValue('abc')).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.STRING,
      }),
    ]);
  });

  should(`emit the correct type for render rules`, () => {
    const configContent = `
    hive.render({
      name: 'ruleA',
      processor: '/a:processorRule',
      inputs: {},
      output: '@out/:output.txt',
    });
    `;
    addFile('/a/c/hive.yaml', {content: configContent});

    const processorContent = `
    hive.declare({
      name: 'processorRule',
      processor: './path/to/processor.js',
      inputs: {},
      output: 'number',
    });
    `;
    addFile('/a/hive.yaml', {content: processorContent});

    const ruleRef = {path: 'a/c', rootType: BuiltInRootType.SYSTEM_ROOT, ruleName: 'ruleA'};
    assert(getTypeOfValue(ruleRef)).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.NUMBER,
      }),
    ]);
  });

  should(`emit error if the render rule's processor is not a declare rule`, () => {
    const configContent = `
    hive.render({
      name: 'ruleA',
      processor: '/a:processorRule',
      inputs: {},
      output: '@out/:output.txt',
    });
    `;
    addFile('/a/c/hive.yaml', {content: configContent});

    const processorContent = `
    hive.load({
      name: 'processorRule',
      srcs: ['./path/to/file.js'],
      output: 'number',
    });
    `;
    addFile('/a/hive.yaml', {content: processorContent});

    const ruleRef = {path: 'a/c', rootType: BuiltInRootType.SYSTEM_ROOT, ruleName: 'ruleA'};
    assert(getTypeOfValue(ruleRef)).to.emitErrorWithMessage(/is invalid/);
  });

  should(`emit the correct type for load rules`, () => {
    const configContent = `
    hive.load({
      name: 'rule',
      srcs: ['/input.txt'],
      output: 'number',
    });
    `;
    addFile('/a/c/hive.yaml', {content: configContent});

    const ruleRef = {path: 'a/c', rootType: BuiltInRootType.SYSTEM_ROOT, ruleName: 'rule'};
    assert(getTypeOfValue(ruleRef)).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.NUMBER,
      }),
    ]);
  });

  should(`emit the correct type for declare rules`, () => {
    const configContent = `
    hive.declare({
      name: 'rule',
      processor: '/processor.js',
      inputs: {},
      output: 'number',
    });
    `;
    addFile('/a/c/hive.yaml', {content: configContent});

    const ruleRef = {path: 'a/c', rootType: BuiltInRootType.SYSTEM_ROOT, ruleName: 'rule'};
    assert(getTypeOfValue(ruleRef)).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.FUNCTION,
      }),
    ]);
  });

  should(`emit the correct type for array of objects`, () => {
    assert(getTypeOfValue([{}])).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: true,
        baseType: ConstType.OBJECT,
      }),
    ]);
  });

  should(`emit the correct type for empty arrays`, () => {
    assert(getTypeOfValue([])).to.emitSequence(['emptyArray']);
  });

  should(`throw if the inner array type is undefined`, () => {
    assert(() => getTypeOfValue([undefined])).to.throwErrorWithMessage(/Unsupported value/);
  });
});

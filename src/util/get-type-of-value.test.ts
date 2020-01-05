import { assert, objectThat, setup, should, test } from '@gs-testing';

import { BuiltInRootType } from '../core/root-type';
import { ConstType } from '../core/type/const-type';
import { OutputType } from '../core/type/output-type';
import { BUILT_IN_PROCESSOR_MAP } from '../processor/built-in-processor-id';
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
    render({
      name: 'ruleA',
      processor: '/a:processorRule',
      inputs: {},
      output: '@out/:output.txt',
    });
    `;
    addFile('/a/c/hive.js', {content: configContent});

    const processorContent = `
    declare({
      name: 'processorRule',
      processor: './path/to/processor.js',
      inputs: {},
      output: 'number',
    });
    `;
    addFile('/a/hive.js', {content: processorContent});

    const ruleRef = {path: 'a/c', rootType: BuiltInRootType.SYSTEM_ROOT, ruleName: 'ruleA'};
    assert(getTypeOfValue(ruleRef)).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.NUMBER,
      }),
    ]);
  });

  should(`emit the correct type for render rules with built in processor`, () => {
    const configContent = `
    render({
      name: 'ruleA',
      processor: '$loadGoogleSheets',
      inputs: {},
      output: '@out/:output.txt',
    });
    `;
    addFile('/a/c/hive.js', {content: configContent});

    const ruleRef = {path: 'a/c', rootType: BuiltInRootType.SYSTEM_ROOT, ruleName: 'ruleA'};
    assert(getTypeOfValue(ruleRef)).to.emitSequence([
      objectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.OBJECT,
      }),
    ]);
  });

  should(`emit error if the render rule's processor is not a declare rule`, () => {
    const configContent = `
    render({
      name: 'ruleA',
      processor: '/a:processorRule',
      inputs: {},
      output: '@out/:output.txt',
    });
    `;
    addFile('/a/c/hive.js', {content: configContent});

    const processorContent = `
    load({
      name: 'processorRule',
      srcs: ['./path/to/file.js'],
      output: 'number',
    });
    `;
    addFile('/a/hive.js', {content: processorContent});

    const ruleRef = {path: 'a/c', rootType: BuiltInRootType.SYSTEM_ROOT, ruleName: 'ruleA'};
    assert(getTypeOfValue(ruleRef)).to.emitErrorWithMessage(/is invalid/);
  });

  should(`emit the correct type for load rules`, () => {
    const configContent = `
    load({
      name: 'rule',
      srcs: ['/input.txt'],
      output: 'number',
    });
    `;
    addFile('/a/c/hive.js', {content: configContent});

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
    declare({
      name: 'rule',
      processor: '/processor.js',
      inputs: {},
      output: 'number',
    });
    `;
    addFile('/a/c/hive.js', {content: configContent});

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

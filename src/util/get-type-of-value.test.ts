import { assert, match, setup, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';
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
      match.anyObjectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.FUNCTION,
      }),
    ]);
  });

  should(`emit the correct type for objects`, () => {
    assert(getTypeOfValue({})).to.emitSequence([
      match.anyObjectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.OBJECT,
      }),
    ]);
  });

  should(`emit the correct type of strings`, () => {
    assert(getTypeOfValue('abc')).to.emitSequence([
      match.anyObjectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.STRING,
      }),
    ]);
  });

  should(`emit the correct type for render rules`, () => {
    const configContent = `
    ruleA:
        render: !!hive/pattern out:output.txt
        processor: !!hive/rule /:a:processorRule
        inputs:
    `;
    addFile('/a/c/hive.yaml', {content: configContent});

    const processorContent = `
    processorRule:
        declare: !!hive/file .:path/to/processor.js
        inputs:
        output: !!hive/o_type number
    `;
    addFile('/a/hive.yaml', {content: processorContent});

    const ruleRef = {path: 'a/c', rootType: RootType.SYSTEM_ROOT, ruleName: 'ruleA'};
    assert(getTypeOfValue(ruleRef)).to.emitSequence([
      match.anyObjectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.NUMBER,
      }),
    ]);
  });

  should(`emit error if the render rule's processor is not a declare rule`, () => {
    const configContent = `
    ruleA:
        render: !!hive/pattern out:output.txt
        processor: !!hive/rule /:a:processorRule
        inputs:
    `;
    addFile('/a/c/hive.yaml', {content: configContent});

    const processorContent = `
    processorRule:
        load: !!hive/file .:path/to/file.js
        as: !!hive/o_type number
    `;
    addFile('/a/hive.yaml', {content: processorContent});

    const ruleRef = {path: 'a/c', rootType: RootType.SYSTEM_ROOT, ruleName: 'ruleA'};
    assert(getTypeOfValue(ruleRef)).to.emitErrorWithMessage(/is invalid/);
  });

  should(`emit the correct type for load rules`, () => {
    const configContent = `
    rule:
        load: !!hive/file /:input.txt
        as: !!hive/o_type number
    `;
    addFile('/a/c/hive.yaml', {content: configContent});

    const ruleRef = {path: 'a/c', rootType: RootType.SYSTEM_ROOT, ruleName: 'rule'};
    assert(getTypeOfValue(ruleRef)).to.emitSequence([
      match.anyObjectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.NUMBER,
      }),
    ]);
  });

  should(`emit the correct type for declare rules`, () => {
    const configContent = `
    rule:
        declare: !!hive/file /:processor.js
        inputs:
        output: !!hive/o_type number
    `;
    addFile('/a/c/hive.yaml', {content: configContent});

    const ruleRef = {path: 'a/c', rootType: RootType.SYSTEM_ROOT, ruleName: 'rule'};
    assert(getTypeOfValue(ruleRef)).to.emitSequence([
      match.anyObjectThat<OutputType>().haveProperties({
        isArray: false,
        baseType: ConstType.FUNCTION,
      }),
    ]);
  });

  should(`emit the correct type for array of objects`, () => {
    assert(getTypeOfValue([{}])).to.emitSequence([
      match.anyObjectThat<OutputType>().haveProperties({
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
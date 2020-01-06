import { assert, objectThat, setup, should, test } from '@gs-testing';

import { ConstType } from '../core/type/const-type';
import { OutputType } from '../core/type/output-type';
import { mockFs } from '../testing/fake-fs';
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

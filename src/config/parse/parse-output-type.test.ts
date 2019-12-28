import { assert, objectThat, should, test } from '@gs-testing';

import { ConstType } from '../../core/type/const-type';
import { OutputType } from '../../core/type/output-type';

import { parseOutputType } from './parse-output-type';

test('@hive/config/parse/parse-output-type', () => {
  should(`parse non arrays correctly`, () => {
    assert(parseOutputType('number')).to
        .equal(objectThat<OutputType>().haveProperties({
          baseType: ConstType.NUMBER,
          isArray: false,
        }));
  });

  should(`parse arrays correctly`, () => {
    assert(parseOutputType('number[]')).to
        .equal(objectThat<OutputType>().haveProperties({
          baseType: ConstType.NUMBER,
          isArray: true,
        }));
  });

  should(`throw error if not an array and base type is invalid`, () => {
    assert(() => parseOutputType('invalid')).to
        .throwErrorWithMessage(/Invalid output type/);
  });

  should(`throw error if array but base type is invalid`, () => {
    assert(() => parseOutputType('invalid[]')).to
        .throwErrorWithMessage(/Invalid output type/);
  });

  should(`throw error if there are no values`, () => {
    assert(() => parseOutputType('')).to.throwErrorWithMessage(/is empty/);
  });

  should(`handle trailing whitespaces`, () => {
    assert(parseOutputType('number\n    ')).to
        .equal(objectThat<OutputType>().haveProperties({
          baseType: ConstType.NUMBER,
          isArray: false,
        }));
  });
});

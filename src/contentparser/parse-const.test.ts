import { assert, numberThat, objectThat, should, test } from '@gs-testing';
import { map } from '@rxjs/operators';

import { ConstType } from '../core/type/const-type';

import { parseContent } from './parse-content';


test('@hive/contentparser/parse-const', () => {
  test('boolean', () => {
    should(`return true if the string is "true"`, () => {
      assert(parseContent('true', {isArray: false, baseType: ConstType.BOOLEAN})).to
          .emitSequence([true]);
    });

    should(`return false if the string is "false"`, () => {
      assert(parseContent('false', {isArray: false, baseType: ConstType.BOOLEAN})).to
          .emitSequence([false]);
    });

    should(`return false if the string is a number`, () => {
      assert(parseContent('123', {isArray: false, baseType: ConstType.BOOLEAN})).to
          .emitSequence([false]);
    });
  });

  test('number', () => {
    should(`handle floats`, () => {
      assert(parseContent('12.3', {isArray: false, baseType: ConstType.NUMBER})).to
          .emitSequence([12.3]);
    });

    should(`handle integers`, () => {
      assert(parseContent('12', {isArray: false, baseType: ConstType.NUMBER})).to
          .emitSequence([12]);
    });

    should(`return NaN if not a number`, () => {
      assert(parseContent('abc', {isArray: false, baseType: ConstType.NUMBER})).to
          .emitSequence([numberThat().beANaN()]);
    });
  });

  test('function', () => {
    should(`return function if the string evaluates to a function`, () => {
      const result$ = parseContent(
          '123;(a, b) => a + b',
          {isArray: false, baseType: ConstType.FUNCTION},
      )
      .pipe(map(fn => (fn as Function)(1, 2)));

      assert(result$).to.emitSequence([3]);
    });

    should(`throw error if the string does not evaluate to a function`, () => {
      assert(parseContent('(a, b) => a + b ;123;', {isArray: false, baseType: ConstType.FUNCTION}))
          .to.emitErrorWithMessage(/result in a function/);
    });
  });

  test('object', () => {
    should(`parse JSON correctly`, () => {
      assert(parseContent('{"a": 1, "b": "abc"}', {isArray: false, baseType: ConstType.OBJECT}))
          .to.emitSequence([
            objectThat().haveProperties({
              a: 1,
              b: 'abc',
            }),
          ]);
    });
  });

  test('string', () => {
    should(`return the string`, () => {
      const str = 'str';

      assert(parseContent(str, {isArray: false, baseType: ConstType.STRING})).to
          .emitSequence([str]);
    });
  });
});

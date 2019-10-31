import { assert, objectThat, should, test } from '@gs-testing';

import { ConstType } from '../core/type/const-type';

import { parseConst } from './parse-const';


test('@hive/contentparser/parse-const', () => {
  test('boolean', () => {
    should(`return true if the string is "true"`, () => {
      assert(parseConst('true', ConstType.BOOLEAN)).to.equal(true);
    });

    should(`return false if the string is "false"`, () => {
      assert(parseConst('false', ConstType.BOOLEAN)).to.equal(false);
    });

    should(`return false if the string is a number`, () => {
      assert(parseConst('123', ConstType.BOOLEAN)).to.equal(false);
    });
  });

  test('number', () => {
    should(`handle floats`, () => {
      assert(parseConst('12.3', ConstType.NUMBER)).to.equal(12.3);
    });

    should(`handle integers`, () => {
      assert(parseConst('12', ConstType.NUMBER)).to.equal(12);
    });

    should(`return NaN if not a number`, () => {
      assert(isNaN(parseConst('abc', ConstType.NUMBER) as number)).to.beTrue();
    });
  });

  test('function', () => {
    should(`return function if the string evaluates to a function`, () => {
      const fn = parseConst('123;(a, b) => a + b', ConstType.FUNCTION);

      assert((fn as Function)(1, 2)).to.equal(3);
    });

    should(`throw error if the string does not evaluate to a function`, () => {
      assert(() => {
        parseConst('(a, b) => a + b ;123;', ConstType.FUNCTION);
      }).to.throwErrorWithMessage(/result in a function/);
    });
  });

  test('object', () => {
    should(`parse JSON correctly`, () => {
      assert(parseConst('{"a": 1, "b": "abc"}', ConstType.OBJECT)).to
          .equal(objectThat().haveProperties({
            a: 1,
            b: 'abc',
          }));
    });
  });

  test('string', () => {
    should(`return the string`, () => {
      const str = 'str';

      assert(parseConst(str, ConstType.STRING)).to.equal(str);
    });
  });
});

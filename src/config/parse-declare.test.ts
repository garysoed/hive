import { assert, mapThat, objectThat, should, test } from '@gs-testing';

import { BuiltInRootType } from '../core/root-type';
import { ConstType } from '../core/type/const-type';

import { parseDeclare } from './parse-declare';


test('@hive/config/parse-declare', () => {

  test('isInputObject', () => {
    should(`detect valid input objects`, () => {
      const inputs = {
        a: {isArray: false, matcher: /boolean/},
        b: {isArray: true, matcher: /number/},
      };
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'path'},
        inputs,
        output: {baseType: ConstType.STRING, isArray: false},
      });

      assert(declareRule).to.equal(objectThat().haveProperties({
        inputs: mapThat().haveExactElements(new Map([
          ['a', objectThat().haveProperties(inputs.a)],
          ['b', objectThat().haveProperties(inputs.b)],
        ])),
      }));
    });
  });

  should(`detect input object with a non Type entry`, () => {
    const inputs = {a: 123, b: {isArray: false, matcher: /number/}};
    const declareRule = parseDeclare('ruleName', {
      declare: {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'path'},
      inputs,
      output: {baseType: ConstType.STRING, isArray: false},
    });

    assert(declareRule).to.beNull();
  });

  should(`detect input objects that are not an object`, () => {
    const inputs = 123;
    const declareRule = parseDeclare('ruleName', {
      declare: {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'path'},
      inputs,
      output: {baseType: ConstType.STRING, isArray: false},
    });

    assert(declareRule).to.beNull();
  });
});

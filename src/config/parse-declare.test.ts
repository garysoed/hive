import { assert, mapThat, objectThat, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';
import { ConstType } from '../core/type/const-type';

import { parseDeclare } from './parse-declare';


test('@hive/config/parse-declare', () => {
  test('parseDeclare', () => {
    should(`return the correct declare object`, () => {
      const ruleName = 'ruleName';
      const processor = {rootType: RootType.SYSTEM_ROOT, path: 'path'};
      const inputs = {
        a: {isArray: false, matcher: /boolean/},
        b: {isArray: true, matcher: /number/},
      };
      const output = {baseType: ConstType.STRING, isArray: false};
      const declareRule = parseDeclare(ruleName, {
        declare: processor,
        inputs,
        output,
      });

      assert(declareRule).to.equal(objectThat().haveProperties({
        name: ruleName,
        processor,
        inputs: mapThat().haveExactElements(new Map([
          ['a', objectThat().haveProperties(inputs.a)],
          ['b', objectThat().haveProperties(inputs.b)],
        ])),
        output: objectThat().haveProperties(output),
      }));
    });

    should(`return null if input object is invalid`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
        inputs: {a: 1},
        output: {baseType: ConstType.STRING, isArray: false},
      });

      assert(declareRule).to.beNull();
    });

    should(`handle empty objects`, () => {
      const ruleName = 'ruleName';
      const processor = {rootType: RootType.SYSTEM_ROOT, path: 'path'};
      const output = {baseType: ConstType.STRING, isArray: false};
      const declareRule = parseDeclare(ruleName, {
        declare: processor,
        inputs: null,
        output,
      });

      assert(declareRule).to.equal(objectThat().haveProperties({
        name: ruleName,
        processor,
        inputs: mapThat().beEmpty(),
        output: objectThat().haveProperties(output),
      }));
    });

    should(`return null if input object is not an object`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
        inputs: 123,
        output: {baseType: ConstType.STRING, isArray: false},
      });

      assert(declareRule).to.beNull();
    });

    should(`return null if output is not a Type`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
        inputs: {
          a: {isArray: false, matcher: /boolean/},
          b: {isArray: true, matcher: /number/},
        },
        output: 123,
      });

      assert(declareRule).to.beNull();
    });

    should(`return null if declare is not a FileRef`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {},
        inputs: {
          a: {isArray: false, matcher: /boolean/},
          b: {isArray: true, matcher: /number/},
        },
        output: {baseType: ConstType.STRING, isArray: false},
      });

      assert(declareRule).to.beNull();
    });
  });

  test('isInputObject', () => {
    should(`detect valid input objects`, () => {
      const inputs = {
        a: {isArray: false, matcher: /boolean/},
        b: {isArray: true, matcher: /number/},
      };
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
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
      declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
      inputs,
      output: {baseType: ConstType.STRING, isArray: false},
    });

    assert(declareRule).to.beNull();
  });

  should(`detect input objects that are not an object`, () => {
    const inputs = 123;
    const declareRule = parseDeclare('ruleName', {
      declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
      inputs,
      output: {baseType: ConstType.STRING, isArray: false},
    });

    assert(declareRule).to.beNull();
  });
});

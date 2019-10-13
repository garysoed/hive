import { assert, match, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';
import { BOOLEAN_TYPE, NUMBER_TYPE, STRING_TYPE } from '../core/type/const-type';

import { parseDeclare } from './parse-declare';

test('@hive/config/parse-declare', () => {
  test('parseDeclare', () => {
    should(`return the correct declare object`, () => {
      const ruleName = 'ruleName';
      const processor = {rootType: RootType.SYSTEM_ROOT, path: 'path'};
      const inputs = {a: BOOLEAN_TYPE, b: NUMBER_TYPE};
      const output = STRING_TYPE;
      const declareRule = parseDeclare(ruleName, {
        declare: processor,
        inputs,
        output,
      });

      assert(declareRule).to.equal(match.anyObjectThat().haveProperties({
        name: ruleName,
        processor,
        inputs,
        output,
      }));
    });

    should(`return null if input object is invalid`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
        inputs: {a: 1},
        output: STRING_TYPE,
      });

      assert(declareRule).to.beNull();
    });

    should(`return null if input object is null`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
        inputs: null,
        output: STRING_TYPE,
      });

      assert(declareRule).to.beNull();
    });

    should(`return null if input object is not an object`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
        inputs: 123,
        output: STRING_TYPE,
      });

      assert(declareRule).to.beNull();
    });

    should(`return null if output is not a Type`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
        inputs: {a: BOOLEAN_TYPE, b: NUMBER_TYPE},
        output: 123,
      });

      assert(declareRule).to.beNull();
    });

    should(`return null if declare is not a FileRef`, () => {
      const declareRule = parseDeclare('ruleName', {
        declare: {},
        inputs: {a: BOOLEAN_TYPE, b: NUMBER_TYPE},
        output: STRING_TYPE,
      });

      assert(declareRule).to.beNull();
    });
  });

  test('isInputObject', () => {
    should(`detect valid input objects`, () => {
      const inputs = {a: BOOLEAN_TYPE, b: NUMBER_TYPE};
      const declareRule = parseDeclare('ruleName', {
        declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
        inputs,
        output: STRING_TYPE,
      });

      assert(declareRule).to.equal(match.anyObjectThat().haveProperties({inputs}));
    });
  });

  should(`detect input object with a non Type entry`, () => {
    const inputs = {a: 123, b: NUMBER_TYPE};
    const declareRule = parseDeclare('ruleName', {
      declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
      inputs,
      output: STRING_TYPE,
    });

    assert(declareRule).to.beNull();
  });

  should(`detect input objects that are not an object`, () => {
    const inputs = 123;
    const declareRule = parseDeclare('ruleName', {
      declare: {rootType: RootType.SYSTEM_ROOT, path: 'path'},
      inputs,
      output: STRING_TYPE,
    });

    assert(declareRule).to.beNull();
  });
});

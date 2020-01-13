import { assert, mapThat, objectThat, should, test } from '@gs-testing';
import { arrayOfType, booleanType, numberType } from '@gs-types';

import { DeclareRule } from '../../core/declare-rule';
import { BuiltInRootType } from '../../core/root-type';
import { fromType } from '../serializer/serializer';

import { declare } from './declare';


test('@hive/config/operator/declare', () => {
  should(`return the correct declare object`, () => {
    const ruleName = 'ruleName';
    const processor = '/path';
    const inputs = {
      a: booleanType,
      b: arrayOfType(numberType),
    };
    const declareRule = declare({
      name: ruleName,
      processor,
      inputs,
      output: fromType(booleanType),
    });

    assert(declareRule).to.equal(objectThat<DeclareRule>().haveProperties({
      name: ruleName,
      processor: objectThat().haveProperties({path: 'path', rootType: BuiltInRootType.SYSTEM_ROOT}),
    }));
  });

  should(`handle empty inputs`, () => {
    const ruleName = 'ruleName';
    const processor = '/path';
    const declareRule = declare({
      name: ruleName,
      processor,
      inputs: {},
      output: fromType(booleanType),
    });

    assert(declareRule).to.equal(objectThat().haveProperties({
      name: ruleName,
      processor: objectThat().haveProperties({path: 'path', rootType: BuiltInRootType.SYSTEM_ROOT}),
      inputs: mapThat().beEmpty(),
    }));
  });
});

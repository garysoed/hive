import { assert, mapThat, objectThat, should, test } from '@gs-testing';

import { DeclareRule } from '../../core/declare-rule';
import { BuiltInRootType } from '../../core/root-type';

import { declare } from './declare';


test('@hive/config/operator/declare', () => {
  should(`return the correct declare object`, () => {
    const ruleName = 'ruleName';
    const processor = '/path';
    const inputs = {
      a: 'boolean',
      b: 'number:[]',
    };
    const declareRule = declare({
      name: ruleName,
      processor,
      inputs,
    });

    assert(declareRule).to.equal(objectThat<DeclareRule>().haveProperties({
      name: ruleName,
      processor: objectThat().haveProperties({path: 'path', rootType: BuiltInRootType.SYSTEM_ROOT}),
    }));

    const a = declareRule.inputs.get('a')!;
    assert(a.isArray).to.beFalse();
    assert(a.matcher.source).to.equal('boolean');

    const b = declareRule.inputs.get('b')!;
    assert(b.isArray).to.beTrue();
    assert(b.matcher.source).to.equal('number');
  });

  should(`handle empty inputs`, () => {
    const ruleName = 'ruleName';
    const processor = '/path';
    const declareRule = declare({
      name: ruleName,
      processor,
      inputs: {},
    });

    assert(declareRule).to.equal(objectThat().haveProperties({
      name: ruleName,
      processor: objectThat().haveProperties({path: 'path', rootType: BuiltInRootType.SYSTEM_ROOT}),
      inputs: mapThat().beEmpty(),
    }));
  });
});

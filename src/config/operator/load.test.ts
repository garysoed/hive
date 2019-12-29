import { arrayThat, assert, objectThat, should, test } from '@gs-testing';

import { BuiltInRootType } from '../../core/root-type';
import { ConstType } from '../../core/type/const-type';

import { glob } from './glob';
import { load } from './load';

test('@hive/config/operator/load', () => {
  should(`parse load rule with glob ref correctly`, () => {
    const ruleName = 'ruleName';
    const globRef = glob('/glob/pattern');
    const config = {
      name: ruleName,
      output: 'number[]',
      srcs: [globRef],
    };

    assert(load(config)).to.equal(objectThat().haveProperties({
      name: ruleName,
      srcs: arrayThat().haveExactElements([objectThat().haveProperties(globRef)]),
      output: objectThat().haveProperties({isArray: true, baseType: ConstType.NUMBER}),
    }));
  });

  should(`parse load rule with file ref correctly`, () => {
    const ruleName = 'ruleName';
    const config = {
      name: ruleName,
      output: 'number[]',
      srcs: ['/file/pattern'],
    };

    assert(load(config)).to.equal(objectThat().haveProperties({
      name: ruleName,
      srcs: arrayThat().haveExactElements([
        objectThat().haveProperties({
          rootType: BuiltInRootType.SYSTEM_ROOT,
          path: 'file/pattern',
        }),
      ]),
      output: objectThat().haveProperties({baseType: ConstType.NUMBER, isArray: true}),
    }));
  });
});

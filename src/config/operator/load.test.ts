import { anyThat, arrayThat, assert, objectThat, should, test } from '@gs-testing';
import { arrayOfType, numberType } from '@gs-types';

import { BuiltInRootType } from '../../core/root-type';
import { fromType, Loader } from '../loader/loader';

import { glob } from './glob';
import { load } from './load';


test('@hive/config/operator/load', () => {
  should(`parse load rule with glob ref correctly`, () => {
    const ruleName = 'ruleName';
    const globRef = glob('/glob/pattern');
    const config = {
      name: ruleName,
      output: fromType(arrayOfType(numberType)),
      srcs: [globRef],
    };

    assert(load(config)).to.equal(objectThat().haveProperties({
      name: ruleName,
      srcs: arrayThat().haveExactElements([objectThat().haveProperties(globRef)]),
      output: anyThat<Loader<unknown>>().passPredicate(
          loader => loader.desc === 'number[]',
          'a number[] loader',
      ),
    }));
  });

  should(`parse load rule with file ref correctly`, () => {
    const ruleName = 'ruleName';
    const config = {
      name: ruleName,
      output: fromType(arrayOfType(numberType)),
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
      output: anyThat<Loader<unknown>>().passPredicate(
          loader => loader.desc === 'number[]',
          'a number[] loader',
      ),
    }));
  });
});

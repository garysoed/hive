import {anyThat, arrayThat, assert, objectThat, should, test} from 'gs-testing';
import {arrayOfType, numberType} from 'gs-types';

import {FileRef} from '../../core/file-ref';
import {GlobRef} from '../../core/glob-ref';
import {LoadRule} from '../../core/load-rule';
import {BuiltInRootType} from '../../core/root-type';
import {fromType, Serializer} from '../serializer/serializer';

import {glob} from './glob';
import {load} from './load';


test('@hive/config/operator/load', () => {
  should('parse load rule with glob ref correctly', () => {
    const ruleName = 'ruleName';
    const globRef = glob('/glob/pattern');
    const config = {
      name: ruleName,
      output: fromType(arrayOfType(numberType)),
      srcs: [globRef],
    };

    assert(load(config)).to.equal(objectThat<LoadRule>().haveProperties({
      name: ruleName,
      srcs: arrayThat<GlobRef>().haveExactElements([objectThat<GlobRef>().haveProperties(globRef)]),
      output: anyThat<Serializer<number[]>>().passPredicate(
          loader => loader.desc === 'number[]',
          'a number[] loader',
      ),
    }));
  });

  should('parse load rule with file ref correctly', () => {
    const ruleName = 'ruleName';
    const config = {
      name: ruleName,
      output: fromType(arrayOfType(numberType)),
      srcs: ['/file/pattern'],
    };

    assert(load(config)).to.equal(objectThat<LoadRule>().haveProperties({
      name: ruleName,
      srcs: arrayThat<FileRef>().haveExactElements([
        objectThat<FileRef>().haveProperties({
          rootType: BuiltInRootType.SYSTEM_ROOT,
          path: 'file/pattern',
        }),
      ]),
      output: anyThat<Serializer<number[]>>().passPredicate(
          loader => loader.desc === 'number[]',
          'a number[] loader',
      ),
    }));
  });
});

import { assert, match, should, test } from '@gs-testing';
import { NumberType } from '@gs-types';

import { RootType } from '../core/root-type';

import { parseLoad } from './parse-load';


test('@hive/config/parse-load', () => {
  test('parseLoad', () => {
    should(`parse load rule with glob ref correctly`, () => {
      const ruleName = 'ruleName';
      const as = {baseType: NumberType, isArray: true};
      const load = {rootType: RootType.SYSTEM_ROOT, globPattern: 'glob/pattern'};

      assert(parseLoad(ruleName, {as, load})).to.equal(match.anyObjectThat().haveProperties({
        name: ruleName,
        srcs: load,
        type: as,
      }));
    });

    should(`parse load rule with file ref correctly`, () => {
      const ruleName = 'ruleName';
      const as = {baseType: NumberType, isArray: true};
      const load = {rootType: RootType.SYSTEM_ROOT, path: 'file/pattern'};

      assert(parseLoad(ruleName, {as, load})).to.equal(match.anyObjectThat().haveProperties({
        name: ruleName,
        srcs: load,
        type: as,
      }));
    });

    should(`return null if load is missing`, () => {
      const ruleName = 'ruleName';
      const as = {baseType: NumberType, isArray: true};

      assert(parseLoad(ruleName, {as})).to.beNull();
    });

    should(`return null if output is missing`, () => {
      const ruleName = 'ruleName';
      const load = {rootType: RootType.SYSTEM_ROOT, path: 'file/pattern'};

      assert(parseLoad(ruleName, {load})).to.beNull();
    });
  });
});

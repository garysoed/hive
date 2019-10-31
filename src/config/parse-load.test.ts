import { assert, objectThat, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';
import { ConstType } from '../core/type/const-type';

import { parseLoad } from './parse-load';


test('@hive/config/parse-load', () => {
  test('parseLoad', () => {
    should(`parse load rule with glob ref correctly`, () => {
      const ruleName = 'ruleName';
      const as = {baseType: ConstType.NUMBER, isArray: true};
      const load = {rootType: RootType.SYSTEM_ROOT, globPattern: 'glob/pattern'};

      assert(parseLoad(ruleName, {as, load})).to.equal(objectThat().haveProperties({
        name: ruleName,
        srcs: load,
        outputType: as,
      }));
    });

    should(`parse load rule with file ref correctly`, () => {
      const ruleName = 'ruleName';
      const as = {baseType: ConstType.NUMBER, isArray: true};
      const load = {rootType: RootType.SYSTEM_ROOT, path: 'file/pattern'};

      assert(parseLoad(ruleName, {as, load})).to.equal(objectThat().haveProperties({
        name: ruleName,
        srcs: load,
        outputType: as,
      }));
    });

    should(`return null if load is missing`, () => {
      const ruleName = 'ruleName';
      const as = {baseType: ConstType.NUMBER, isArray: true};

      assert(parseLoad(ruleName, {as})).to.beNull();
    });

    should(`return null if output is missing`, () => {
      const ruleName = 'ruleName';
      const load = {rootType: RootType.SYSTEM_ROOT, path: 'file/pattern'};

      assert(parseLoad(ruleName, {load})).to.beNull();
    });
  });
});

import { arrayThat, assert, should, test } from '@gs-testing';

import { ConstType } from '../core/type/const-type';

import { parseContent } from './parse-content';


test('@hive/contentparser/parse-array', () => {
  should(`parse arrays correctly`, () => {
    assert(parseContent('[1, 2, 3]', {isArray: true, baseType: ConstType.NUMBER})).to
        .emitSequence([arrayThat().haveExactElements([1, 2, 3])]);
  });

  should(`return array with one element if parses into a non array`, () => {
    assert(parseContent('123', {isArray: true, baseType: ConstType.NUMBER})).to
        .emitSequence([arrayThat().haveExactElements([123])]);
  });
});

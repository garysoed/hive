import { arrayThat, assert, should, test } from '@gs-testing';

import { ConstType } from '../core/type/const-type';

import { parseContent } from './parse-content';


test('@hive/contentparser/parse-content', () => {
  should(`parse arrays correctly`, () => {
    assert(parseContent('[1, 2, 3]', {baseType: ConstType.NUMBER, isArray: true})).to
        .emitSequence([arrayThat().haveExactElements([1, 2, 3])]);
  });

  should(`parse simple types correctly`, () => {
    assert(parseContent('123', {baseType: ConstType.NUMBER, isArray: false})).to
        .emitSequence([123]);
  });
});

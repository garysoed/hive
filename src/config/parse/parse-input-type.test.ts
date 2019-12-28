import { assert, objectThat, should, test } from '@gs-testing';

import { parseInputType } from './parse-input-type';

test('@hive/config/parse/parse-input-type', () => {
  should(`parse valid regex correctly`, () => {
    assert(parseInputType('abc:gi')).to
        .equal(objectThat().haveProperties({
          isArray: false,
          matcher: objectThat().haveProperties({
            source: 'abc',
            flags: 'gi',
          }),
        }));
  });

  should(`parse valid regex without flags correctly`, () => {
    assert(parseInputType('abc')).to
        .equal(objectThat().haveProperties({
          isArray: false,
          matcher: objectThat().haveProperties({
            source: 'abc',
            flags: '',
          }),
        }));
  });

  should(`parse valid regex array correctly`, () => {
    assert(parseInputType('abc:gi[]')).to
        .equal(objectThat().haveProperties({
          isArray: true,
          matcher: objectThat().haveProperties({
            source: 'abc',
            flags: 'gi',
          }),
        }));
  });

  should(`parse valid regex array without flags correctly`, () => {
    assert(parseInputType('abc:[]')).to
        .equal(objectThat().haveProperties({
          isArray: true,
          matcher: objectThat().haveProperties({
            source: 'abc',
            flags: '',
          }),
        }));
  });

  should(`throw error if value is empty`, () => {
    assert(() => parseInputType('')).to.throwErrorWithMessage(/is empty/);
  });

  should(`handle trailing white spaces`, () => {
    assert(parseInputType('abc:gi\n   ')).to
        .equal(objectThat().haveProperties({
          matcher: objectThat().haveProperties({
            source: 'abc',
            flags: 'gi',
          }),
        }));
  });
});

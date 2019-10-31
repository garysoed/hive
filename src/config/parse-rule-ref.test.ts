import { assert, objectThat, should, test } from '@gs-testing';

import { RootType } from '../core/root-type';

import { parseRuleRef } from './parse-rule-ref';


test('@hive/config/parse-rule-ref', () => {
  should(`parse rule reference correctly`, () => {
    assert(parseRuleRef('/:path/to/dir:rulename')).to
        .equal(objectThat().haveProperties({
          rootType: RootType.SYSTEM_ROOT,
          path: 'path/to/dir',
          ruleName: 'rulename',
        }));
  });

  should(`throw error if rule name is missing`, () => {
    assert(() => parseRuleRef('/:path/to/dir:')).to.throwErrorWithMessage(/Invalid rule ref/);
  });

  should(`throw error if path is missing`, () => {
    assert(() => parseRuleRef('/::ruleName')).to.throwErrorWithMessage(/Invalid file ref/);
  });

  should(`throw error if root type is missing`, () => {
    assert(() => parseRuleRef(':path:ruleName')).to.throwErrorWithMessage(/Invalid file ref/);
  });
});

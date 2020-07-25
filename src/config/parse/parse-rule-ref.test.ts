import { assert, objectThat, should, test } from 'gs-testing';

import { BuiltInRootType } from '../../core/root-type';
import { RuleRef } from '../../core/rule-ref';

import { parseRuleRef } from './parse-rule-ref';

test('@hive/config/parse/parse-rule-ref', () => {
  should(`parse rule reference correctly`, () => {
    assert(parseRuleRef('/path/to/dir:rulename')).to
        .equal(objectThat<RuleRef>().haveProperties({
          rootType: BuiltInRootType.SYSTEM_ROOT,
          path: 'path/to/dir',
          ruleName: 'rulename',
        }));
  });

  should(`throw error if rule name is missing`, () => {
    assert(() => parseRuleRef('/path/to/dir:')).to.throwErrorWithMessage(/Invalid rule ref/);
  });

  should(`handle white spaces`, () => {
    assert(parseRuleRef('/path/to/dir:rulename\n  ')).to
        .equal(objectThat<RuleRef>().haveProperties({
          rootType: BuiltInRootType.SYSTEM_ROOT,
          path: 'path/to/dir',
          ruleName: 'rulename',
        }));
  });
});

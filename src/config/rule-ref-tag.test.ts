import * as yaml from 'yaml';

import { assert, objectThat, should, test } from '@gs-testing';

import { BuiltInRootType } from '../core/root-type';

import { RULE_REF_TAG } from './rule-ref-tag';


test('@hive/config/rule-ref-tag', () => {
  test('resolve', () => {
    should(`parse rule reference correctly`, () => {
      assert(yaml.parse('!!hive/rule /:path/to/dir:rulename', {tags: [RULE_REF_TAG]})).to
          .equal(objectThat().haveProperties({
            rootType: BuiltInRootType.SYSTEM_ROOT,
            path: 'path/to/dir',
            ruleName: 'rulename',
          }));
    });

    should(`throw error if rule name is missing`, () => {
      assert(() => yaml.parse('!!hive/rule /:path/to/dir:', {tags: [RULE_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid rule ref/);
    });

    should(`throw error if path is missing`, () => {
      assert(() => yaml.parse('!!hive/rule /::ruleName', {tags: [RULE_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid file ref/);
    });

    should(`throw error if root type is missing`, () => {
      assert(() => yaml.parse('!!hive/rule :path:ruleName', {tags: [RULE_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid file ref/);
    });

    should(`throw error if value is missing`, () => {
      assert(() => yaml.parse('!!hive/rule', {tags: [RULE_REF_TAG]})).to
          .throwErrorWithMessage(/Invalid rule ref/);
    });

    should(`handle white spaces`, () => {
      assert(yaml.parse('!!hive/rule /:path/to/dir:rulename\n  ', {tags: [RULE_REF_TAG]})).to
          .equal(objectThat().haveProperties({
            rootType: BuiltInRootType.SYSTEM_ROOT,
            path: 'path/to/dir',
            ruleName: 'rulename',
          }));
    });
  });
});

import * as yaml from 'yaml';

import { assert, should, test } from '@gs-testing';

import { TYPE_TAG } from './type-tag';

test('@hive/config/type-tag', () => {
  should(`parse correctly`, () => {
    const result = yaml.parse('!!hive/type number', {tags: [TYPE_TAG]});

    assert(result).to.equal('number');
  });
});

import { assert, should, test } from '@gs-testing';

import { parseConfig } from './parse-config';

test('@hive/config/parse-config', () => {
  should(`throw error if a rule is invalid`, () => {
    const CONTENT = `
invalid-rule:
    a: b
    `;

    assert(() => {
      parseConfig(CONTENT);
    }).to.throwErrorWithMessage(/is an invalid rule/);
  });
});

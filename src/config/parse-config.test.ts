import { assert, should, test } from '@gs-testing/main';

import { parseConfig } from './parse-config';

test('@hive.parseConfig', () => {
  should.only(`throw error if a rule is invalid`, () => {
    const CONTENT = `
invalid-rule:
    a: b
    `;

    assert(() => {
      parseConfig(CONTENT);
    }).to.throwErrorWithMessage(/is an invalid rule/);
  });
});

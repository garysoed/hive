import { assert, should, test } from '@gs-testing';

import { runProcessor } from './run-processor';

test('@hive/util/run-processor', () => {
  should(`run the processor correctly and return the correct value`, () => {
    // tslint:disable-next-line: no-invalid-template-strings
    const result = runProcessor(
        '$hive.a + $hive.b + $hiveGlobals.g',
        new Map([['a', 1], ['b', 2]]),
        {g: 3},
    );
    assert(result).to.equal(6);
  });
});

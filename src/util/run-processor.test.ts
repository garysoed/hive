import { assert, should, test } from '@gs-testing';

import { runProcessor } from './run-processor';

test('@hive/util/run-processor', () => {
  should(`run the processor correctly and return the correct value`, () => {
    // tslint:disable-next-line: no-invalid-template-strings
    assert(runProcessor('$hive.a + $hive.b', new Map([['a', 1], ['b', 2]]))).to.equal('3');
  });
});

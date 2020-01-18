import { assert, setup, should, test } from '@gs-testing';
import { numberType, stringType } from '@gs-types';

import { ProcessorSpec } from './processor-spec';

interface TestObject {
  readonly a: number;
  readonly b: string;
}

test('@hive/processor/processor-spec', () => {
  let spec: ProcessorSpec<TestObject>;

  setup(() => {
    spec = new ProcessorSpec({a: numberType, b: stringType});
  });

  test('checkInputs', () => {
    should(`output the inputs as objects`, () => {
      const inputs = new Map<string, unknown>([['a', 123], ['b', 'abc']]);
      const obj = spec.checkInputs(inputs);

      assert(obj).to.haveProperties({a: 123, b: 'abc'});
    });

    should(`throw error if one of the inputs is invalid`, () => {
      const inputs = new Map<string, unknown>([['a', 123], ['b', 345]]);

      assert(() => {
        spec.checkInputs(inputs);
      }).to.throwErrorWithMessage(/is not of type/);
    });

    should(`throw error if one of the inputs is missing`, () => {
      const inputs = new Map<string, unknown>([['a', 123]]);

      assert(() => {
        spec.checkInputs(inputs);
      }).to.throwErrorWithMessage(/is not of type/);
    });
  });
});

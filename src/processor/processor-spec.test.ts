import {assert, should, test, setup} from 'gs-testing';
import {numberType, stringType} from 'gs-types';

import {ProcessorSpec} from './processor-spec';


test('@hive/processor/processor-spec', () => {
  const _ = setup(() => {
    const spec = new ProcessorSpec({a: numberType, b: stringType});
    return {spec};
  });

  test('checkInputs', () => {
    should('output the inputs as objects', () => {
      const inputs = new Map<string, unknown>([['a', 123], ['b', 'abc']]);
      const obj = _.spec.checkInputs(inputs);

      assert(obj).to.haveProperties({a: 123, b: 'abc'});
    });

    should('throw error if one of the inputs is invalid', () => {
      const inputs = new Map<string, unknown>([['a', 123], ['b', 345]]);

      assert(() => {
        _.spec.checkInputs(inputs);
      }).to.throwErrorWithMessage(/is not of type/);
    });

    should('throw error if one of the inputs is missing', () => {
      const inputs = new Map<string, unknown>([['a', 123]]);

      assert(() => {
        _.spec.checkInputs(inputs);
      }).to.throwErrorWithMessage(/is not of type/);
    });
  });
});

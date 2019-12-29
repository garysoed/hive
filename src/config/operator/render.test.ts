import { assert, mapThat, objectThat, setThat, should, test } from '@gs-testing';

import { RenderInput } from '../../core/render-input';
import { BuiltInRootType } from '../../core/root-type';

import { render } from './render';


test('@hive/config/operator/render', () => {
  should(`return correct render object`, () => {
    const ruleName = 'ruleName';
    const config = {
      inputs: {inputA: 1, inputB: 'two'},
      name: ruleName,
      output: '/path/to/{out}',
      processor: '@out/path/to/rule:rule',
    };
    const renderRule = render(config);

    assert(renderRule).to.equal(objectThat().haveProperties({
      name: ruleName,
      processor: objectThat().haveProperties({
        rootType: BuiltInRootType.OUT_DIR,
        path: 'path/to/rule',
        ruleName: 'rule',
      }),
      inputs: mapThat().haveExactElements(new Map<string, RenderInput>([
        ['inputA', 1],
        ['inputB', 'two'],
      ])),
      output: objectThat().haveProperties({
        rootType: BuiltInRootType.SYSTEM_ROOT,
        pattern: 'path/to/{out}',
        substitutionKeys: setThat().haveExactElements(new Set(['out'])),
      }),
    }));
  });

  should(`handle empty inputs`, () => {
    const ruleName = 'ruleName';
    const config = {
      inputs: {},
      name: ruleName,
      output: '/path/to/{out}',
      processor: '@out/path/to/rule:rule',
    };

    const renderRule = render(config);

    assert(renderRule).to.equal(objectThat().haveProperties({
      name: ruleName,
      processor: objectThat().haveProperties({
        rootType: BuiltInRootType.OUT_DIR,
        path: 'path/to/rule',
        ruleName: 'rule',
      }),
      inputs: mapThat().beEmpty(),
      output: objectThat().haveProperties({
        rootType: BuiltInRootType.SYSTEM_ROOT,
        pattern: 'path/to/{out}',
        substitutionKeys: setThat().haveExactElements(new Set(['out'])),
      }),
    }));
  });
});

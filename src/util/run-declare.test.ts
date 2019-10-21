import { assert, setup, should, test } from '@gs-testing';
import { map } from '@rxjs/operators';

import { DeclareRule } from '../core/declare-rule';
import { RootType } from '../core/root-type';
import { RuleType } from '../core/rule-type';
import { ConstType } from '../core/type/const-type';
import { addFile, mockFs } from '../testing/fake-fs';

import { runDeclare } from './run-declare';


test('@hive/util/run-declare', () => {
  setup(() => {
    mockFs();
  });

  should(`emit function that runs the processor correctly`, () => {
    // tslint:disable-next-line: no-invalid-template-strings
    const content = '`${$hive.a + $hive.b}`';
    addFile('/a/b.js', {content});

    const rule: DeclareRule = {
      type: RuleType.DECLARE,
      name: 'testRule',
      inputs: new Map([
        ['a', {isArray: false, matcher: /number/}],
        ['b', {isArray: false, matcher: /number/}],
      ]),
      output: {isArray: false, baseType: ConstType.NUMBER},
      processor: {rootType: RootType.SYSTEM_ROOT, path: 'a/b.js'},
    };

    assert(runDeclare(rule).pipe(map(fn => fn(new Map([['a', 1], ['b', 2]])))))
        .to.emitSequence(['3']);
  });
});

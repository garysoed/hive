import * as path from 'path';

import { assert, setup, should, test } from '@gs-testing';
import { numberType } from '@gs-types';
import { map } from '@rxjs/operators';

import { StringSerializer } from '../config/serializer/string-serializer';
import { DeclareRule } from '../core/declare-rule';
import { BuiltInRootType } from '../core/root-type';
import { RuleType } from '../core/rule-type';
import { ROOT_FILE_NAME } from '../project/find-root';
import { addFile, mockFs } from '../testing/fake-fs';

import { runRule } from './run-rule';


test('@hive/util/run-declare', () => {
  setup(() => {
    mockFs();
  });

  should(`emit function that runs the processor correctly`, () => {
    const configContent = JSON.stringify({outdir: 'out'});
    addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    // tslint:disable-next-line: no-invalid-template-strings
    const content = 'output(`${a + b}`)';
    addFile('/a/b.js', {content});

    const rule: DeclareRule = {
      type: RuleType.DECLARE,
      name: 'testRule',
      inputs: new Map([
        ['a', numberType],
        ['b', numberType],
      ]),
      output: new StringSerializer(),
      processor: {rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a/b.js'},
    };

    assert(runRule(rule).pipe(map(({fn}) => fn(new Map([['a', 1], ['b', 2]])))))
        .to.emitSequence(['3']);
  });
});

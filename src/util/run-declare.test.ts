import * as path from 'path';

import {Vine} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {FakeFs} from 'gs-testing/export/fake';
import {numberType} from 'gs-types';
import {map} from 'rxjs/operators';

import {StringSerializer} from '../config/serializer/string-serializer';
import {DeclareRule} from '../core/declare-rule';
import {BuiltInRootType} from '../core/root-type';
import {RuleType} from '../core/rule-type';
import {$fs} from '../external/fs';
import {ROOT_FILE_NAME} from '../project/find-root';

import {runRule} from './run-rule';


test('@hive/util/run-declare', () => {
  const _ = setup(() => {
    const fakeFs = new FakeFs();
    const vine = new Vine({
      overrides: [
        {override: $fs, withValue: fakeFs},
      ],
    });
    return {fakeFs, vine};
  });

  should('emit function that runs the processor correctly', async () => {
    const configContent = JSON.stringify({outdir: 'out'});
    _.fakeFs.addFile(path.join('/', ROOT_FILE_NAME), {content: configContent});

    // tslint:disable-next-line: no-invalid-template-strings
    const content = 'output(`${a + b}`)';
    _.fakeFs.addFile('/a/b.js', {content});

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

    const cwd = 'cwd';
    await asyncAssert(
        runRule(_.vine, rule, cwd).pipe(map(({fn}) => fn(_.vine, new Map([['a', 1], ['b', 2]])))))
        .to.emitSequence(['3']);
  });
});

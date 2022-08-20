import {Vine} from 'grapevine';
import {arrayThat, assert, should, test} from 'gs-testing';
import {FakeFs, FakeGlobFactory} from 'gs-testing/export/fake';
import {stringType} from 'gs-types';
import {BehaviorSubject} from 'rxjs';

import {fromType} from '../config/serializer/serializer';
import {LoadRule} from '../core/load-rule';
import {BuiltInRootType} from '../core/root-type';
import {RuleType} from '../core/rule-type';
import {$fs} from '../external/fs';
import {$glob} from '../external/glob';

import {runRule} from './run-rule';


test('@hive/util/run-load', init => {
  const _ = init(() => {
    const fakeFs = new FakeFs();
    const fakeGlobFactory = new FakeGlobFactory();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $fs, withValue: fakeFs},
        {override: $glob, withValue: fakeGlobFactory.glob.bind(fakeGlobFactory)},
      ],
    });
    return {fakeFs, fakeGlobFactory, vine};
  });

  should('emit content of file if file ref was given', () => {
    const content = 'content';
    _.fakeFs.addFile('/a/b/c.txt', {content});

    const rule: LoadRule = {
      name: 'loadRule',
      srcs: [{rootType: BuiltInRootType.SYSTEM_ROOT, path: 'a/b/c.txt'}],
      type: RuleType.LOAD,
      output: fromType(stringType),
    };

    const cwd = 'cwd';
    assert(runRule(_.vine, rule, cwd)).to.emitSequence([arrayThat<string>().haveExactElements([content])]);
  });

  should('emit content of all matching files if glob ref was given', () => {
    const contentC = 'contentC';
    _.fakeFs.addFile('/a/b/c.txt', {content: contentC});

    const contentD = 'contentD';
    _.fakeFs.addFile('/a/b/d.txt', {content: contentD});

    const contentE = 'contentE';
    _.fakeFs.addFile('/a/b/e.txt', {content: contentE});

    _.fakeGlobFactory.setGlobHandler(
        'a/b/*.txt',
        '/',
        new BehaviorSubject(['/a/b/c.txt', '/a/b/d.txt', '/a/b/e.txt']),
    );

    const rule: LoadRule = {
      name: 'loadRule',
      srcs: [{rootType: BuiltInRootType.SYSTEM_ROOT, globPattern: 'a/b/*.txt'}],
      type: RuleType.LOAD,
      output: fromType(stringType),
    };

    const cwd = 'cwd';
    assert(runRule(_.vine, rule, cwd)).to.emitSequence([
      arrayThat<string>().haveExactElements([contentC, contentD, contentE]),
    ]);
  });
});

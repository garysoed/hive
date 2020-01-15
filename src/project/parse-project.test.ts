import * as path from 'path';

import { assert, mapThat, objectThat, should, test } from '@gs-testing';

import { parseProject } from './parse-project';


test('@hive/project/parse-project', () => {
  should(`parse the config correctly`, () => {
    const outdir = 'file/outdir';
    const rootA = 'path/root/a';
    const rootB = 'path/root/b';
    const content = JSON.stringify({
      outdir,
      globals: {
        a: 1,
        b: 'abc',
      },
      roots: {
        rootA,
        rootB,
      },
    });

    const cwd = 'cwd';
    assert(parseProject(content, cwd)).to.equal(objectThat().haveProperties({
      outdir,
      globals: mapThat().haveExactElements(new Map<string, unknown>([
        ['a', 1],
        ['b', 'abc'],
      ])),
      roots: mapThat().haveExactElements(new Map<string, unknown>([
        ['rootA', path.join(cwd, rootA)],
        ['rootB', path.join(cwd, rootB)],
      ])),
    }));
  });

  should(`parse the config correctly if globals and roots are not specified`, () => {
    const outdir = 'file/outdir';
    const content = JSON.stringify({outdir});

    const cwd = 'cwd';
    assert(parseProject(content, cwd)).to.equal(objectThat().haveProperties({
      outdir,
    }));
  });

  should(`throw error if globals is not an object`, () => {
    assert(() => {
      const content = JSON.stringify({outdir: 'outdir', globals: 1});
      const cwd = 'cwd';
      parseProject(content, cwd);
    }).to.throwErrorWithMessage(/TypeAssertionError/);
  });

  should(`throw error if config is invalid`, () => {
    assert(() => {
      const cwd = 'cwd';
      parseProject('a: b', cwd);
    }).to.throwErrorWithMessage(/JSON/);
  });
});

import { assert, mapThat, objectThat, should, test } from '@gs-testing';

import { parseProject } from './parse-project';


test('@hive/project/parse-project', () => {
  should(`parse the config correctly`, () => {
    const outdir = 'file/outdir';
    const content = `
    outdir: ${outdir}
    globals:
        a: 1
        b: abc
    `;

    assert(parseProject(content)).to.equal(objectThat().haveProperties({
      outdir,
      globals: mapThat().haveExactElements(new Map<string, unknown>([
        ['a', 1],
        ['b', 'abc'],
      ])),
    }));
  });

  should(`parse the config correctly if globals is not specified`, () => {
    const outdir = 'file/outdir';
    const content = `outdir: ${outdir}`;

    assert(parseProject(content)).to.equal(objectThat().haveProperties({
      outdir,
    }));
  });

  should(`throw error if globals is not an object`, () => {
    assert(() => {
      const content = `
      outdir: outdir
      globals: 1
      `;
      parseProject(content);
    }).to.throwErrorWithMessage(/project config file/);
  });

  should(`throw error if config is invalid`, () => {
    assert(() => {
      parseProject('a: b');
    }).to.throwErrorWithMessage(/project config file/);
  });
});

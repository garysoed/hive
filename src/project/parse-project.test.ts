import { assert, should, test } from '@gs-testing';

import { parseProject } from './parse-project';

test('@hive/project/parse-project', () => {
  should(`parse the config correctly`, () => {
    const outdir = 'file/outdir';
    const content = `outdir: ${outdir}`;
    const config = parseProject(content);

    assert(config.outdir).to.equal(outdir);
  });

  should(`throw error if config is invalid`, () => {
    assert(() => {
      parseProject('a: b');
    }).to.throwErrorWithMessage(/project config file/);
  });
});

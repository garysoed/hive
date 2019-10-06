import { assert, should, test } from '@gs-testing/main';

import { parseProject } from './parse-project';

test('@hive.parseProject', () => {
  should.only(`parse the config correctly`, () => {
    const outdir = 'file/outdir';
    const content = `outdir: ${outdir}`;
    const config = parseProject(content);

    assert(config.outdir).to.equal(outdir);
  });

  should.only(`throw error if config is invalid`, () => {
    assert(() => {
      parseProject('a: b');
    }).to.throwErrorWithMessage(/project config file/);
  });
});

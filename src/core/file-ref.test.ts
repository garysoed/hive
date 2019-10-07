import * as path from 'path';

import { assert, setup, should, test } from '@gs-testing';

import { ROOT_FILE_NAME } from '../project/find-root';
import { addFile, mockFs } from '../testing/fake-fs';
import { mockProcess, setCwd } from '../testing/fake-process';

import { FileRef } from './file-ref';

test('@hive/core/file-ref', () => {
  setup(() => {
    mockFs();
    mockProcess();
  });

  test('content$', () => {
    should(`load path correctly`, () => {
      setCwd('/a/b/c');

      addFile(path.join('/a', ROOT_FILE_NAME), {content: `outdir: outdir`});

      const content = 'content';
      addFile('/a/b/d/e', {content});

      const ref = new FileRef('b/d/e');
      assert(ref.content$).to.emitSequence([content]);
    });

    should(`load output files correctly`, () => {
      setCwd('/a/b/c');

      const outdir = '/outdir';
      addFile(path.join('/a', ROOT_FILE_NAME), {content: `outdir: ${outdir}`});

      const content = 'content';
      addFile(path.join(outdir, 'd/e'), {content});

      const ref = new FileRef('out:///d/e');
      assert(ref.content$).to.emitSequence([content]);
    });

    should(`treat unknown protocol as a file path`, () => {
      setCwd('/a/b/c');

      const outdir = '/outdir';
      addFile(path.join('/a', ROOT_FILE_NAME), {content: `outdir: ${outdir}`});

      const content = 'content';
      addFile('/a/unknown:/d/e', {content});

      const ref = new FileRef('unknown:///d/e');
      assert(ref.content$).to.emitSequence([content]);
    });
  });
});

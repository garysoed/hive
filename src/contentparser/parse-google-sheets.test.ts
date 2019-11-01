import { assert, objectThat, should, test } from '@gs-testing';

import { MediaTypeType } from '../core/type/media-type-type';

import { parseContent } from './parse-content';

test('@hive/contentparser/parse-google-sheets', () => {
  const EXPECTED_TYPE = {
    isArray: false,
    baseType: new MediaTypeType('application', 'vnd.google-apps.spreadsheet'),
  };

  should(`emit the correct metadata object`, () => {
    const metadata = {
      doc_id: 'docId',
    };

    assert(parseContent(JSON.stringify(metadata), EXPECTED_TYPE)).to
        .emitSequence([objectThat().haveProperties(metadata)]);
  });

  should(`emit error if the json is incorrect`, () => {
    assert(parseContent(JSON.stringify({}), EXPECTED_TYPE)).to
        .emitErrorWithMessage(/Invalid Google Sheets/);
  });
});

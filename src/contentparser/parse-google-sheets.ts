import { HasPropertiesType, StringType } from '@gs-types';

import { GoogleSheetsMetadata } from './google-sheets-metadata';

const TYPE = HasPropertiesType({
  doc_id: StringType,
});

export function parseGoogleSheets(
    content: string,
): GoogleSheetsMetadata {
  const json = JSON.parse(content);
  if (!TYPE.check(json)) {
    throw new Error(`Invalid Google Sheets file`);
  }

  return json;
}

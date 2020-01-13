import { hasPropertiesType, stringType } from '@gs-types';

export interface GoogleSheetsMetadata {
  doc_id: string;
}

export const GOOGLE_SHEETS_METADATA_TYPE = hasPropertiesType({
  doc_id: stringType,
});

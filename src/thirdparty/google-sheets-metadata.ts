import {hasPropertiesType, stringType, Type} from 'gs-types';

export interface GoogleSheetsMetadata {
  doc_id: string;
}

export const GOOGLE_SHEETS_METADATA_TYPE: Type<GoogleSheetsMetadata> = hasPropertiesType({
  doc_id: stringType,
});

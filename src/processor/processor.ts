import {Vine} from 'grapevine';

export enum ProcessorId {
  LOAD_GOOGLE_SHEETS = 'loadGoogleSheets'
}

export type Processor = (vine: Vine, input: string, config: {}) => Promise<string>;
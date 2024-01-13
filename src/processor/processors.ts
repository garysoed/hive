import {loadGoogleSheetsProcessor} from './load-google-sheets';
import {Processor, ProcessorId} from './processor';

export const PROCESSORS: ReadonlyMap<ProcessorId, Processor> = new Map([
  [ProcessorId.LOAD_GOOGLE_SHEETS, loadGoogleSheetsProcessor],
]);
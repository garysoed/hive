import { EnumType, Type } from '@gs-types';

import { Processor } from '../core/processor';

import { LOAD_GOOGLE_SHEETS } from './load-google-sheets';


export enum BuiltInProcessorId {
  LOAD_GOOGLE_SHEETS = '$loadGoogleSheets',
}

export const BUILT_IN_PROCESSOR_TYPE: Type<BuiltInProcessorId> = EnumType(BuiltInProcessorId);

export const BUILT_IN_PROCESSOR_MAP: ReadonlyMap<BuiltInProcessorId, Processor> = new Map([
  [BuiltInProcessorId.LOAD_GOOGLE_SHEETS, LOAD_GOOGLE_SHEETS],
]);

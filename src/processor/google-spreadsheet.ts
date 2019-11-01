/**
 * Simplified representation of GoogleSpreadsheet.
 */
export interface GoogleSpreadsheet {
  sheets: GoogleShreadsheetSheet[];
}

interface GoogleShreadsheetSheet {
  data: string[][];
  maxCol: number;
  maxRow: number;
}

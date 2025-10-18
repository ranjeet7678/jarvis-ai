export interface ExcelFormulaResponse {
  formula: string;
  explanation: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  result: string;
  timestamp: string;
}
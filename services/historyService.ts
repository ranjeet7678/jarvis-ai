import type { HistoryItem } from '../types';

const HISTORY_KEY = 'excelFormulaHistory';

export function getHistory(): HistoryItem[] {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    if (!historyJson) {
      return [];
    }
    const history = JSON.parse(historyJson) as HistoryItem[];
    // Sort by timestamp, newest first
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
}

export function saveToHistory(prompt: string, result: string): void {
  try {
    const currentHistory = getHistory();
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      prompt,
      result,
      timestamp: new Date().toISOString(),
    };
    // Add new item to the front and limit history size to 50 items
    const updatedHistory = [newItem, ...currentHistory].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save to history", error);
  }
}

export function clearHistory(): void {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Failed to clear history", error);
    }
}
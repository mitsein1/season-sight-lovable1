
export interface PatternReturnItem {
  year: number;
  return: number;
}

export interface MiscMetrics {
  trades: number;
  calendar_days: number;
  std_dev: number;
  sortino_ratio: number;
  sharpe_ratio: number;
  volatility: number;
  current_streak: number;
  gains: number;
}

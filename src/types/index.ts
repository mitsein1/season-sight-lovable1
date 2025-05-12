
export interface PatternReturnItem {
  year: number;
  return: number;
}

export interface MiscMetrics {
  trades: number;
  calendar_days: number | null;
  std_dev: number | null;
  sortino_ratio: number | null;
  sharpe_ratio: number | null;
  volatility: number | null;
  current_streak: number;
  gains: number;
}

export interface TradeStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_pct: number | null;
  loss_pct: number | null;
}

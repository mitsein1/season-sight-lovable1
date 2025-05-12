
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

export interface TradeStats {
  total_trades: number;
  wins: number;          // Changed from winning_trades to match the API
  losses: number;        // Changed from losing_trades to match the API
  win_pct: number;
  loss_pct: number;
}

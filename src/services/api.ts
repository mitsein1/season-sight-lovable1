import { toast } from "sonner";


// Tipi raw che arrivano dal backend
export interface ScreenerRaw {
  Symbol:             string;
  Instrument:         string | null;
  "Annualized return": number;
  "Average return":    number;
  "Median return":     number;
  "Pattern Start":     string;
  "Pattern End":       string;
  "Cal. Days":         number;
  "Max Profit":        number;
  "Max Loss":          number;
  "No. of Winners":    number;
  "No. of Trades":     number;
  "Win Ratio":         string;   // es. "67%"
  "Std Dev":           number;
  "Sharpe Ratio":      number;
}

// Forma che userà ScreenerPage
export interface ScreenerPattern {
  rank:               number;
  symbol:             string;
  instrument:         string;
  annualized_return:  number;
  average_return:     number;
  median_return:      number;
  pattern_start:      string;
  pattern_end:        string;
  calendar_days:      number;
  max_profit:         number;
  max_loss:           number;
  num_winners:        number;
  num_trades:         number;
  win_ratio:          number;
  std_dev:            number;
  sharpe_ratio:       number;
}


// Base URL for the API
const API_BASE_URL = "https://price-pattern-backend.onrender.com";

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    const errorMsg = `API Error (${response.status}): ${errorText || response.statusText}`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data as T;
};

// Types for API responses
export interface PriceSeries {
  dates: string[];
  prices: number[];
}

export interface CumulativeProfitItem {
  year: number;
  cumulative_profit: number;
}

export interface PatternReturnItem {
  year: number;
  return: number;
}

export interface YearlyStatistic {
  year:               number;
  start_date:         string;
  end_date:           string;
  start_price?:       number;
  end_price?:         number;
  profit?:            number;
  profit_percentage?: number;
  max_rise?:          number;
  max_drop?:          number;
}

export interface ProfitSummary {
  total_profit:   number;
  average_profit: number;
}

export interface GainsLosses {
  gains:    number;
  losses:   number;
  gain_pct: number;
  loss_pct: number;
  max_gain: number;
  max_loss: number;
}

export interface MiscMetrics {
  trades:         number;
  calendar_days:  number | null;
  std_dev:        number;
  sortino_ratio:  number;
  sharpe_ratio:   number;
  volatility:     number;
  current_streak: number;
  gains:          number;
}

export interface Seasonality {
  dates:          string[];
  average_prices: number[];
}

export interface TradeStats {
  total_trades: number;
  wins:         number;  // Changed from winning_trades
  losses:       number;  // Changed from losing_trades
  win_pct:      number;
  loss_pct:     number;
}

// New type for Screener pattern
export interface ScreenerPattern {
  rank: number;
  symbol: string;
  instrument: string;
  annualized_return: number;
  average_return: number;
  median_return: number;
  pattern_start: string; // "MM-DD"
  pattern_end: string;   // "MM-DD"
  calendar_days: number;
  max_profit: number;
  max_loss: number;
  num_winners: number;
  num_trades: number;
  win_ratio: number;
  std_dev: number;
  sharpe_ratio: number;
}

export interface ScreenerResponse {
  patterns: ScreenerPattern[];
}

// API functions

export const fetchPriceSeries = async (
  asset: string,
  year:  number
): Promise<PriceSeries> => {
  const url = `${API_BASE_URL}/api/price-series?asset=${encodeURIComponent(asset)}&year=${year}`;
  console.log(`Fetching price series with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<PriceSeries>(response);
};

export const fetchCumulativeProfit = async (
  asset:    string,
  startDay: string,
  endDay:   string
): Promise<CumulativeProfitItem[]> => {
  const url =
    `${API_BASE_URL}/api/cumulative-profit` +
    `?asset=${encodeURIComponent(asset)}` +
    `&start_day=${encodeURIComponent(startDay)}` +
    `&end_day=${encodeURIComponent(endDay)}`;
  console.log(`Fetching cumulative profit with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<CumulativeProfitItem[]>(response);
};

export const fetchPatternReturns = async (
  asset:    string,
  startDay: string,
  endDay:   string
): Promise<PatternReturnItem[]> => {
  const url =
    `${API_BASE_URL}/api/pattern-returns` +
    `?asset=${encodeURIComponent(asset)}` +
    `&start_day=${encodeURIComponent(startDay)}` +
    `&end_day=${encodeURIComponent(endDay)}`;
  console.log(`Fetching pattern returns with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<PatternReturnItem[]>(response);
};

export const fetchPatternStatistics = async (
  asset:    string,
  startDay: string,
  endDay:   string
): Promise<YearlyStatistic[]> => {
  const url =
    `${API_BASE_URL}/api/pattern-statistics` +
    `?asset=${encodeURIComponent(asset)}` +
    `&start_day=${encodeURIComponent(startDay)}` +
    `&end_day=${encodeURIComponent(endDay)}`;
  console.log(`Fetching pattern statistics with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<YearlyStatistic[]>(response);
};

export const fetchProfitSummary = async (
  asset:    string,
  startDay: string,
  endDay:   string
): Promise<ProfitSummary> => {
  const url =
    `${API_BASE_URL}/api/profit-summary` +
    `?asset=${encodeURIComponent(asset)}` +
    `&start_day=${encodeURIComponent(startDay)}` +
    `&end_day=${encodeURIComponent(endDay)}`;
  console.log(`Fetching profit summary with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<ProfitSummary>(response);
};

export const fetchGainsLosses = async (
  asset:     string,
  startDay:  string,
  endDay:    string,
  yearsBack?: number
): Promise<GainsLosses> => {
  let url =
    `${API_BASE_URL}/api/gains-losses` +
    `?asset=${encodeURIComponent(asset)}` +
    `&start_day=${encodeURIComponent(startDay)}` +
    `&end_day=${encodeURIComponent(endDay)}`;

  if (yearsBack !== undefined) {
    url += `&years_back=${yearsBack}`;
  }

  console.log("Fetching gains & losses with URL:", url);
  const response = await fetch(url);
  return handleResponse<GainsLosses>(response);
};

export const fetchMiscMetrics = async (
  asset:     string,
  yearsBack: number,
  startDay:  string,
  endDay:    string
): Promise<MiscMetrics> => {
  const url =
    `${API_BASE_URL}/api/misc-metrics` +
    `?asset=${encodeURIComponent(asset)}` +
    `&years_back=${yearsBack}` +
    `&start_day=${encodeURIComponent(startDay)}` +
    `&end_day=${encodeURIComponent(endDay)}`;
  console.log(`Fetching misc metrics with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<MiscMetrics>(response);
};

export const fetchSeasonality = async (
  asset:     string,
  yearsBack: number,
  startDay?: string,
  endDay?:   string
): Promise<Seasonality> => {
  let url =
    `${API_BASE_URL}/api/seasonality` +
    `?asset=${encodeURIComponent(asset)}` +
    `&years_back=${yearsBack}`;
  if (startDay) url += `&start_day=${encodeURIComponent(startDay)}`;
  if (endDay)   url += `&end_day=${encodeURIComponent(endDay)}`;
  console.log(`Fetching seasonality with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<Seasonality>(response);
};


export const downloadCSV = async (
  asset: string,
  startDay: string,
  endDay: string
): Promise<void> => {
  const url =
    `${API_BASE_URL}/api/export` +
    `?asset=${encodeURIComponent(asset)}` +
    `&start_day=${encodeURIComponent(startDay)}` +
    `&end_day=${encodeURIComponent(endDay)}` +
    `&format=csv`;
  console.log(`Downloading CSV with URL: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    const msg = `Download CSV failed (${response.status}): ${errorText || response.statusText}`;
    toast.error(msg);
    throw new Error(msg);
  }
  const blob = await response.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${asset}_${startDay}_${endDay}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const fetchTradeStats = async (
  asset:     string,
  startDay:  string,
  endDay:    string,
  yearsBack?: number
): Promise<TradeStats> => {
  const params = new URLSearchParams({
    asset,
    start_day: startDay,
    end_day:   endDay,
  });
  if (yearsBack !== undefined) {
    params.append("years_back", yearsBack.toString());
  }

  const url = `${API_BASE_URL}/api/trade-stats?${params.toString()}`;
  console.log("🔄 Fetching trade stats:", url);

  const res = await fetch(url);
  // Otteniamo il JSON “raw”
  const raw = await handleResponse<any>(res);

  // Rimappiamo i campi raw → TradeStats
  return {
    total_trades: raw.total_trades ?? raw.trades_count ?? 0,
    wins:         raw.num_winners    ?? raw.winning_trades ?? 0,
    losses:       raw.num_losers     ?? raw.losing_trades  ?? 0,
    win_pct:      raw.win_ratio      ?? raw.win_pct        ?? 0,
    loss_pct:     raw.loss_ratio     ?? raw.loss_pct       ?? 0,
  };
};


export interface SeasonalityRangeSmoothed {
  dates: string[];
  values: number[];
}

export const fetchSeasonalityRangeSmoothed = async (
  asset: string,
  yearsBack: number,
  startDay: string,
  endDay: string
): Promise<SeasonalityRangeSmoothed> => {
  const params = new URLSearchParams({ asset, years_back: yearsBack.toString(), start_day: startDay, end_day: endDay });
  const url = `${API_BASE_URL}/api/seasonality/data-range-savgol?${params.toString()}`;
  console.log("→ Fetching seasonality data (smoothed):", url);
  const res = await fetch(url);
  return handleResponse<SeasonalityRangeSmoothed>(res);
};

// src/services/api.ts

// src/services/api.ts

// Tipi raw che arrivano dal backend
export interface ScreenerRaw {
  Symbol:             string;
  Instrument:         string | null;
  "Annualized return": number;
  "Average return":    number;
  "Median return":     number;
  "Pattern Start":     string;
  "Pattern End":       string;
  "Cal. Days":         number;
  "Max Profit":        number;
  "Max Loss":          number;
  "No. of Winners":    number;
  "No. of Trades":     number;
  "Win Ratio":         string;   // es. "67%"
  "Std Dev":           number;
  "Sharpe Ratio":      number;
}

// Shape che userà ScreenerPage
export interface ScreenerPattern {
  rank:               number;
  symbol:             string;
  instrument:         string;
  annualized_return:  number;  // percentuale, es. 5.13
  average_return:     number;  // percentuale
  median_return:      number;  // percentuale
  pattern_start:      string;  // es. "13 May"
  pattern_end:        string;  // es. "12 Jun"
  calendar_days:      number;
  max_profit:         number;  // percentuale
  max_loss:           number;  // percentuale (negativo se perdita)
  num_winners:        number;
  num_trades:         number;
  win_ratio:          number;  // intero percentuale, es. 67
  std_dev:            number;  // percentuale
  sharpe_ratio:       number;
}

// Screener API function
export const fetchScreenerResults = async (
  marketGroup:       string,
  startDateOffset:   string,
  patternLength:     number | string,
  yearsBack:         number | string,
  minWinPct:         number | string
): Promise<ScreenerPattern[]> => {
  // Log the parameters for debugging
  console.log("Screener parameters:", {
    marketGroup, 
    startDateOffset, 
    patternLength, 
    yearsBack, 
    minWinPct
  });
  
  const params = new URLSearchParams({
    market_group:       marketGroup,
    start_date_offset:  startDateOffset,
    pattern_length:     String(patternLength),
    years_back:         String(yearsBack),
    min_win_pct:        String(minWinPct),
    direction:          "long",
  });
  const url = `${API_BASE_URL}/api/screener?${params.toString()}`;
  console.log("🔍 Fetching screener:", url);

  // GET request
  const res = await fetch(url);
  // Receive ScreenerRaw array
  const rawData = await handleResponse<ScreenerRaw[]>(res);

  // Map to the format needed by the table
  const mappedData = rawData.map((item, i) => ({
    rank:              i + 1,
    symbol:            item.Symbol,
    instrument:        item.Instrument || item.Symbol,
    annualized_return: Number((item["Annualized return"] * 100).toFixed(2)),
    average_return:    Number((item["Average return"]   * 100).toFixed(2)),
    median_return:     Number((item["Median return"]    * 100).toFixed(2)),
    pattern_start:     item["Pattern Start"],
    pattern_end:       item["Pattern End"],
    calendar_days:     item["Cal. Days"],
    max_profit:        Number((item["Max Profit"] * 100).toFixed(2)),
    max_loss:          Number((item["Max Loss"]   * 100).toFixed(2)),
    num_winners:       item["No. of Winners"],
    num_trades:        item["No. of Trades"],
    win_ratio:         Number(item["Win Ratio"].replace("%", "")),
    std_dev:           Number((item["Std Dev"]  * 100).toFixed(2)),
    sharpe_ratio:      Number(item["Sharpe Ratio"].toFixed(2)),
  }));

  console.log(`Received ${mappedData.length} patterns from API`);
  
  return mappedData;
};

// … il resto del file rimane immutato …

export interface MarketGroups {
  [group: string]: string[];
}

export const fetchMarketGroups = async (): Promise<MarketGroups> => {
  const res = await fetch(`${API_BASE_URL}/api/market-groups`);
  return handleResponse<MarketGroups>(res);
};

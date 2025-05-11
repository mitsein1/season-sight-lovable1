import { toast } from "sonner";

// Base URL for the API
const API_BASE_URL = "https://price-pattern-backend.onrender.com"; // Updated API URL

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

// --- sostituito PatternReturn con questo singolo item ---
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
  calendar_days:  number;
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
  asset:    string,
  startDay: string,
  endDay:   string
): Promise<GainsLosses> => {
  const url =
    `${API_BASE_URL}/api/gains-losses` +
    `?asset=${encodeURIComponent(asset)}` +
    `&start_day=${encodeURIComponent(startDay)}` +
    `&end_day=${encodeURIComponent(endDay)}`;
  console.log(`Fetching gains & losses with URL: ${url}`);
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

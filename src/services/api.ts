
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

export interface PatternReturn {
  year: number[];
  return: number[];
}

export interface YearlyStatistic {
  year: number;
  start_date: string;
  end_date: string;
  start_price?: number;
  end_price?: number;
  profit?: number;
  profit_percentage?: number;
  max_rise?: number;
  max_drop?: number;
}

export interface ProfitSummary {
  total_profit: number;
  average_profit: number;
}

export interface GainsLosses {
  number_of_gains: number;
  number_of_losses: number;
  profit_percentage: number;
  max_profit: number;
  max_loss: number;
}

export interface MiscMetrics {
  number_of_trades: number;
  trading_days: number;
  std_deviation: number;
  sortino_ratio: number;
  sharpe_ratio: number;
  volatility: number;
  calendar_days: number;
  current_streak: number;
  number_of_gains: number;
}

export interface Seasonality {
  dates: string[];
  average_prices: number[];
}

// API functions
export const fetchPriceSeries = async (asset: string, year: number): Promise<PriceSeries> => {
  const url = `${API_BASE_URL}/api/price-series?asset=${encodeURIComponent(asset)}&year=${year}`;
  const response = await fetch(url);
  return handleResponse<PriceSeries>(response);
};

export const fetchCumulativeProfit = async (
  asset: string,
  startDay: string,
  endDay: string
): Promise<Array<CumulativeProfitItem>> => {
  // Use MM-DD format directly without conversion
  const url = `${API_BASE_URL}/api/cumulative-profit?asset=${encodeURIComponent(asset)}&start_day=${startDay}&end_day=${endDay}`;
  
  console.log(`Fetching cumulative profit with URL: ${url}`);
  
  const response = await fetch(url);
  return handleResponse<Array<CumulativeProfitItem>>(response);
};

export const fetchPatternReturns = async (
  asset: string,
  startDay: string,
  endDay: string
): Promise<PatternReturn> => {
  const url = `${API_BASE_URL}/api/pattern-returns?asset=${encodeURIComponent(asset)}&start_day=${startDay}&end_day=${endDay}`;
  console.log(`Fetching pattern returns with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<PatternReturn>(response);
};

export const fetchPatternStatistics = async (
  asset: string,
  startDay: string,
  endDay: string
): Promise<YearlyStatistic[]> => {
  // Use MM-DD format directly
  const url = `${API_BASE_URL}/api/pattern-statistics?asset=${encodeURIComponent(asset)}&start_day=${startDay}&end_day=${endDay}`;
  console.log(`Fetching pattern statistics with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<YearlyStatistic[]>(response);
};

export const fetchProfitSummary = async (
  asset: string,
  startDay: string,
  endDay: string
): Promise<ProfitSummary> => {
  const url = `${API_BASE_URL}/api/profit-summary?asset=${encodeURIComponent(asset)}&start_day=${startDay}&end_day=${endDay}`;
  console.log(`Fetching profit summary with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<ProfitSummary>(response);
};

export const fetchGainsLosses = async (
  asset: string,
  startDay: string,
  endDay: string
): Promise<GainsLosses> => {
  const url = `${API_BASE_URL}/api/gains-losses?asset=${encodeURIComponent(asset)}&start_day=${startDay}&end_day=${endDay}`;
  console.log(`Fetching gains losses with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<GainsLosses>(response);
};

export const fetchMiscMetrics = async (
  asset: string,
  startDay: string,
  endDay: string,
  yearsBack: number
): Promise<MiscMetrics> => {
  // Add years_back parameter
  const url = `${API_BASE_URL}/api/misc-metrics?asset=${encodeURIComponent(asset)}&years_back=${yearsBack}&start_day=${startDay}&end_day=${endDay}`;
  console.log(`Fetching misc metrics with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<MiscMetrics>(response);
};

export const fetchSeasonality = async (
  asset: string,
  yearsBack: number,
  startDay?: string,
  endDay?: string
): Promise<Seasonality> => {
  // Use years_back and MM-DD format
  let url = `${API_BASE_URL}/api/seasonality?asset=${encodeURIComponent(asset)}&years_back=${yearsBack}`;
  
  if (startDay) url += `&start_day=${startDay}`;
  if (endDay) url += `&end_day=${endDay}`;
  
  console.log(`Fetching seasonality with URL: ${url}`);
  const response = await fetch(url);
  return handleResponse<Seasonality>(response);
};

export const downloadCSV = async (
  asset: string,
  startDay: string,
  endDay: string
): Promise<void> => {
  const url = `${API_BASE_URL}/api/export?asset=${encodeURIComponent(asset)}&start_day=${startDay}&end_day=${endDay}&format=csv`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    toast.error(`Download failed: ${errorText || response.statusText}`);
    throw new Error(`Download failed: ${errorText || response.statusText}`);
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${asset}_${startDay}_${endDay}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// List of available assets for the dropdown
export const availableAssets = [
  { value: "AAPL", label: "Apple Inc. (AAPL)" },
  { value: "MSFT", label: "Microsoft Corp. (MSFT)" },
  { value: "GOOGL", label: "Alphabet Inc. (GOOGL)" },
  { value: "AMZN", label: "Amazon.com Inc. (AMZN)" },
  { value: "TSLA", label: "Tesla Inc. (TSLA)" },
  { value: "BTC-USD", label: "Bitcoin (BTC-USD)" },
  { value: "ETH-USD", label: "Ethereum (ETH-USD)" },
  { value: "EURUSD", label: "EUR/USD" },
];

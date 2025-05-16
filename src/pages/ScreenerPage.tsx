import React, { useState, useMemo, useEffect } from "react";
import { parse, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { fetchScreenerResults, ScreenerPattern } from "@/services/api";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type SortOrder = "asc" | "desc";

interface SortState {
  column: keyof ScreenerPattern | null;
  order: SortOrder;
}

// Helper function to safely format numbers with toFixed
const safeToFixed = (value: number | undefined | null, digits: number = 2): string => {
  if (value === undefined || value === null) return "N/A";
  return value.toFixed(digits);
};

export default function ScreenerPage() {
  const navigate = useNavigate();

  // Filter state
  const [marketGroup, setMarketGroup] = useState("NASDAQ 100");
  const [startDateOffset, setStartDateOffset] = useState("today");
  const [patternLength, setPatternLength] = useState(60);
  const [yearsBack, setYearsBack] = useState<number | "max">(15);
  const [minWinPct, setMinWinPct] = useState(55);
  const [sortState, setSortState] = useState<SortState>({ column: "rank", order: "asc" });

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ["screener", marketGroup, startDateOffset, patternLength, yearsBack, minWinPct],
    queryFn: () =>
      fetchScreenerResults(marketGroup, startDateOffset, patternLength, yearsBack, minWinPct),
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load screener data");
      console.error(error);
    }
  }, [error]);

  const handleSort = (column: keyof ScreenerPattern) => {
    setSortState(prev => ({
      column,
      order: prev.column === column && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      if (!sortState.column) return 0;
      const aVal = a[sortState.column];
      const bVal = b[sortState.column];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.order === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [data, sortState]);

  const handleRowClick = (pattern: ScreenerPattern) => {
    // Fixed: Use the exact same date format from pattern_start and pattern_end
    try {
      const isoStart = format(
        parse(pattern.pattern_start, "dd MMM", new Date()),
        "MM-dd"
      );
      const isoEnd = format(
        parse(pattern.pattern_end, "dd MMM", new Date()),
        "MM-dd"
      );

      // Use the same yearsBack value from the screener
      const ybVal = typeof yearsBack === "number" ? yearsBack : 15;
      
      console.log(`Navigating to dashboard with params:`, {
        asset: pattern.symbol,
        start_day: isoStart,
        end_day: isoEnd,
        years_back: ybVal,
        instrument: pattern.instrument // Pass instrument name
      });
      
      navigate(
        `/dashboard?asset=${pattern.symbol}` +
          `&start_day=${isoStart}` +
          `&end_day=${isoEnd}` +
          `&years_back=${ybVal}` +
          `&instrument=${encodeURIComponent(pattern.instrument || '')}`
      );
    } catch (err) {
      console.error("Navigation error:", err);
      toast.error("Error navigating to dashboard");
    }
  };

  // Options
  const marketOptions = ["NASDAQ 100", "S&P 500", "DOW 30", "Russell 2000", "Forex", "Crypto"];
  const offsetOptions = [
    { value: "today", label: "Today" },
    { value: "+1d", label: "Tomorrow" },
    { value: "+7d", label: "In 7 days" },
    { value: "+15d", label: "In 15 days" },
    { value: "+30d", label: "In 30 days" },
  ];
  const durationOptions = [
    { value: 7, label: "7 days" },
    { value: 15, label: "15 days" },
    { value: 30, label: "30 days" },
    { value: 60, label: "60 days" },
  ];
  const yearsBackOptions = [
    { value: 3, label: "3 years" },
    { value: 5, label: "5 years" },
    { value: 10, label: "10 years" },
    { value: 15, label: "15 years" },
    { value: 20, label: "20 years" },
    { value: 25, label: "25 years" },
    { value: "max", label: "Max" },
  ];
  const winPctOptions = Array.from({ length: 21 }, (_, i) => ({ value: i * 5, label: `${i * 5}%` }));

  const renderSortIcon = (column: keyof ScreenerPattern) => {
    if (sortState.column !== column) return null;
    return sortState.order === "asc" ? (
      <ArrowUp className="inline ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="inline ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Pattern Screener</h1>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          {/* Market */}
          <div>
            <label className="block text-sm font-medium mb-1">Market:</label>
            <Select value={marketGroup} onValueChange={setMarketGroup}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                {marketOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Start date:</label>
            <Select value={startDateOffset} onValueChange={setStartDateOffset}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select start date" />
              </SelectTrigger>
              <SelectContent>
                {offsetOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Years Back */}
          <div>
            <label className="block text-sm font-medium mb-1">Examination period:</label>
            <Select
              value={String(yearsBack)}
              onValueChange={val => setYearsBack(val === 'max' ? 'max' : Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select years" />
              </SelectTrigger>
              <SelectContent>
                {yearsBackOptions.map(opt => (
                  <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1">Time Period:</label>
            <Select value={patternLength.toString()} onValueChange={val => setPatternLength(Number(val))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(opt => (
                  <SelectItem key={opt.value.toString()} value={opt.value.toString()}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Win% */}
          <div>
            <label className="block text-sm font-medium mb-1">Filter: Win %</label>
            <Select value={minWinPct.toString()} onValueChange={val => setMinWinPct(Number(val))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select win %" />
              </SelectTrigger>
              <SelectContent>
                {winPctOptions.map(opt => (
                  <SelectItem key={opt.value.toString()} value={opt.value.toString()}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Direction */}
          <div>
            <label className="block text-sm font-medium mb-1">Direction:</label>
            <div className="flex items-center h-10 space-x-4 bg-gray-100 dark:bg-slate-700 rounded px-3">
              <label className="flex items-center space-x-2">
                <input type="radio" checked readOnly className="text-blue-600" />
                <span>Long</span>
              </label>
              <label className="flex items-center space-x-2 opacity-50">
                <input type="radio" disabled className="text-blue-600" />
                <span>Short</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-auto">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("rank")} className="cursor-pointer whitespace-nowrap sticky left-0 bg-white dark:bg-slate-800">
                    Rank {renderSortIcon("rank")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("symbol")} className="cursor-pointer whitespace-nowrap">
                    Symbol {renderSortIcon("symbol")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("instrument")} className="cursor-pointer whitespace-nowrap">
                    Instrument {renderSortIcon("instrument")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("annualized_return")} className="cursor-pointer whitespace-nowrap">
                    Annualized Return {renderSortIcon("annualized_return")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("average_return")} className="cursor-pointer whitespace-nowrap">
                    Average Return {renderSortIcon("average_return")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("median_return")} className="cursor-pointer whitespace-nowrap">
                    Median Return {renderSortIcon("median_return")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("pattern_start")} className="cursor-pointer whitespace-nowrap">
                    Pattern Start {renderSortIcon("pattern_start")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("pattern_end")} className="cursor-pointer whitespace-nowrap">
                    Pattern End {renderSortIcon("pattern_end")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("calendar_days")} className="cursor-pointer whitespace-nowrap">
                    Cal. Days {renderSortIcon("calendar_days")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("max_profit")} className="cursor-pointer whitespace-nowrap">
                    Max Profit {renderSortIcon("max_profit")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("max_loss")} className="cursor-pointer whitespace-nowrap">
                    Max Loss {renderSortIcon("max_loss")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("num_winners")} className="cursor-pointer whitespace-nowrap">
                    No. of Winners {renderSortIcon("num_winners")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("num_trades")} className="cursor-pointer whitespace-nowrap">
                    No. of Trades {renderSortIcon("num_trades")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("win_ratio")} className="cursor-pointer whitespace-nowrap">
                    Win Ratio {renderSortIcon("win_ratio")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("std_dev")} className="cursor-pointer whitespace-nowrap">
                    Std Dev {renderSortIcon("std_dev")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("sharpe_ratio")} className="cursor-pointer whitespace-nowrap">
                    Sharpe Ratio {renderSortIcon("sharpe_ratio")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((pattern) => (
                  <TableRow 
                    key={`${pattern.rank}-${pattern.symbol}`} 
                    className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" 
                    onClick={() => handleRowClick(pattern)}
                  >
                    <TableCell className="sticky left-0 bg-white dark:bg-slate-800">{pattern.rank}</TableCell>
                    <TableCell className="font-medium">{pattern.symbol}</TableCell>
                    <TableCell>{pattern.instrument}</TableCell>
                    <TableCell className={pattern.annualized_return >= 0 ? "text-green-600" : "text-red-600"}>
                      {pattern.annualized_return >= 0 ? "+" : ""}{safeToFixed(pattern.annualized_return, 2)}%
                    </TableCell>
                    <TableCell className={pattern.average_return >= 0 ? "text-green-600" : "text-red-600"}>
                      {pattern.average_return >= 0 ? "+" : ""}{safeToFixed(pattern.average_return, 2)}%
                    </TableCell>
                    <TableCell className={pattern.median_return >= 0 ? "text-green-600" : "text-red-600"}>
                      {pattern.median_return >= 0 ? "+" : ""}{safeToFixed(pattern.median_return, 2)}%
                    </TableCell>
                    <TableCell>{pattern.pattern_start}</TableCell>
                    <TableCell>{pattern.pattern_end}</TableCell>
                    <TableCell>{pattern.calendar_days}</TableCell>
                    <TableCell className="text-green-600">+{safeToFixed(pattern.max_profit, 2)}%</TableCell>
                    <TableCell className="text-red-600">-{safeToFixed(Math.abs(pattern.max_loss), 2)}%</TableCell>
                    <TableCell>{pattern.num_winners}</TableCell>
                    <TableCell>{pattern.num_trades}</TableCell>
                    <TableCell>{safeToFixed(pattern.win_ratio, 1)}%</TableCell>
                    <TableCell>{safeToFixed(pattern.std_dev, 2)}%</TableCell>
                    <TableCell>{safeToFixed(pattern.sharpe_ratio, 2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No patterns found matching your criteria.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

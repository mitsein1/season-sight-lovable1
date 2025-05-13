
import React, { useState } from "react";
import { parse, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { fetchScreenerResults, ScreenerPattern } from "@/services/api";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type SortOrder = "asc" | "desc";

interface SortState {
  column: keyof ScreenerPattern | null;
  order: SortOrder;
}

const ScreenerPage = () => {
  const navigate = useNavigate();
  
  // Filter state
  const [marketGroup, setMarketGroup] = useState("NASDAQ 100");
  const [startDateOffset, setStartDateOffset] = useState("today");
  const [patternLength, setPatternLength] = useState(60);
  const [yearsBack, setYearsBack] = useState<number | "max">(15);
  const [minWinPct, setMinWinPct] = useState(55);
  const [sortState, setSortState] = useState<SortState>({
    column: "rank",
    order: "asc",
  });

  // Fetch data with React Query v5
  const { data, isLoading, error } = useQuery({
    queryKey: ["screener", marketGroup, startDateOffset, patternLength, yearsBack, minWinPct],
    queryFn: () => fetchScreenerResults(marketGroup, startDateOffset, patternLength, yearsBack, minWinPct),
  });

  // Handle sort
  const handleSort = (column: keyof ScreenerPattern) => {
    setSortState((prev) => ({
      column,
      order: prev.column === column && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Navigate to dashboard with pattern data
  const handleRowClick = (pattern: ScreenerPattern) => {
    navigate('/', { 
      state: { 
        asset: pattern.symbol,
        startDay: pattern.pattern_start,
        endDay: pattern.pattern_end,
        yearsBack: typeof yearsBack === 'number' ? yearsBack : 15
      } 
    });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      if (sortState.column === null) return 0;
      
      const valueA = a[sortState.column];
      const valueB = b[sortState.column];
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortState.order === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortState.order === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      return 0;
    });
  }, [data, sortState]);

  // Show error toast if query fails
  React.useEffect(() => {
    if (error) {
      toast.error("Failed to load screener data");
      console.error("Screener API error:", error);
    }
  }, [error]);

  // Define filter options
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
    { value: 60, label: "31-60 days" },
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
  const winPctOptions = Array.from({ length: 21 }, (_, i) => ({ 
    value: i * 5, 
    label: `${i * 5}%` 
  }));

  // Table column headers with sort indicators
  const renderSortIndicator = (column: keyof ScreenerPattern) => {
    if (sortState.column !== column) return null;
    return sortState.order === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Pattern Screener</h1>
        
        {/* Filters section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div>
            <label className="text-sm font-medium mb-1 block">Market:</label>
            <Select value={marketGroup} onValueChange={setMarketGroup}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                {marketOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Start date:</label>
            <Select value={startDateOffset} onValueChange={setStartDateOffset}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select start date" />
              </SelectTrigger>
              <SelectContent>
                {offsetOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Examination period:</label>
            <Select
              value={String(yearsBack)}
              onValueChange={(value) =>
                setYearsBack(value === "max" ? "max" : Number(value))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select years" />
              </SelectTrigger>
              <SelectContent>
                {yearsBackOptions.map(option => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Time Period:</label>
            <Select 
              value={patternLength.toString()} 
              onValueChange={(value) => setPatternLength(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(option => (
                  <SelectItem key={option.value.toString()} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Filter: Win %</label>
            <Select 
              value={minWinPct.toString()} 
              onValueChange={(value) => setMinWinPct(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select win %" />
              </SelectTrigger>
              <SelectContent>
                {winPctOptions.map(option => (
                  <SelectItem key={option.value.toString()} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Direction:</label>
            <div className="flex items-center h-10 space-x-4 bg-gray-100 dark:bg-slate-700 rounded px-3">
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  checked={true} 
                  readOnly 
                  className="form-radio text-blue-600"
                />
                <span>Long</span>
              </label>
              <label className="flex items-center space-x-2 opacity-50">
                <input 
                  type="radio" 
                  disabled 
                  className="form-radio text-blue-600" 
                />
                <span>Short</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Results summary */}
        {data && (
          <div className="mb-4">
            <p className="text-lg font-medium">
              Found {data.length || 0} patterns
            </p>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        
        {/* Results table */}
        {!isLoading && data && (
          <div className="overflow-x-auto">
            <Table className="border rounded-md">
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("rank")}
                  >
                    Rank{renderSortIndicator("rank")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("symbol")}
                  >
                    Symbol{renderSortIndicator("symbol")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("instrument")}
                  >
                    Instrument{renderSortIndicator("instrument")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("annualized_return")}
                  >
                    Annualized return{renderSortIndicator("annualized_return")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("average_return")}
                  >
                    Average return{renderSortIndicator("average_return")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("median_return")}
                  >
                    Median return{renderSortIndicator("median_return")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("pattern_start")}
                  >
                    Pattern Start{renderSortIndicator("pattern_start")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("pattern_end")}
                  >
                    Pattern End{renderSortIndicator("pattern_end")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("calendar_days")}
                  >
                    Cal. Days{renderSortIndicator("calendar_days")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("max_profit")}
                  >
                    Max Profit{renderSortIndicator("max_profit")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("max_loss")}
                  >
                    Max Loss{renderSortIndicator("max_loss")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("num_winners")}
                  >
                    No. of Winners{renderSortIndicator("num_winners")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("num_trades")}
                  >
                    No. of Trades{renderSortIndicator("num_trades")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("win_ratio")}
                  >
                    Win Ratio{renderSortIndicator("win_ratio")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("std_dev")}
                  >
                    Std Dev{renderSortIndicator("std_dev")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("sharpe_ratio")}
                  >
                    Sharpe Ratio{renderSortIndicator("sharpe_ratio")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((pattern) => (
                  <TableRow 
                    key={`${pattern.rank}-${pattern.symbol}`}
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    onClick={() => handleRowClick(pattern)}
                  >
                    <TableCell>{pattern.rank}</TableCell>
                    <TableCell className="font-medium">{pattern.symbol}</TableCell>
                    <TableCell>{pattern.instrument}</TableCell>
                    <TableCell className={pattern.annualized_return > 0 ? 'text-green-600' : 'text-red-600'}>
                      {typeof pattern.annualized_return === 'number' ? 
                        `${pattern.annualized_return > 0 ? '+' : ''}${pattern.annualized_return.toFixed(2)}%` : 
                        pattern.annualized_return}
                    </TableCell>
                    <TableCell className={pattern.average_return > 0 ? 'text-green-600' : 'text-red-600'}>
                      {typeof pattern.average_return === 'number' ?
                        `${pattern.average_return > 0 ? '+' : ''}${pattern.average_return.toFixed(2)}%` :
                        pattern.average_return}
                    </TableCell>
                    <TableCell className={pattern.median_return > 0 ? 'text-green-600' : 'text-red-600'}>
                      {typeof pattern.median_return === 'number' ? 
                        `${pattern.median_return > 0 ? '+' : ''}${pattern.median_return.toFixed(2)}%` : 
                        pattern.median_return}
                    </TableCell>
                    <TableCell>{pattern.pattern_start}</TableCell>
                    <TableCell>{pattern.pattern_end}</TableCell>
                    <TableCell>{pattern.calendar_days}</TableCell>
                    <TableCell className="text-green-600">
                      {typeof pattern.max_profit === 'number' ? `+${pattern.max_profit.toFixed(2)}%` : pattern.max_profit}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {typeof pattern.max_loss === 'number' ? pattern.max_loss.toFixed(2) + '%' : pattern.max_loss}
                    </TableCell>
                    <TableCell>{pattern.num_winners}</TableCell>
                    <TableCell>{pattern.num_trades}</TableCell>
                    <TableCell>
                      {typeof pattern.win_ratio === 'number' ? `${pattern.win_ratio}%` : pattern.win_ratio}
                    </TableCell>
                    <TableCell>{pattern.std_dev?.toFixed(2)}%</TableCell>
                    <TableCell>{pattern.sharpe_ratio?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center py-6">
                      No patterns found with the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenerPage;


import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchScreenerResults } from "@/services/api";
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
import { SeasonaxProvider } from "@/context/SeasonaxContext";

type SortOrder = "asc" | "desc";

interface SortState {
  column: string | null;
  order: SortOrder;
}

const ScreenerContent = () => {
  // Filter state
  const [marketGroup, setMarketGroup] = useState("NASDAQ 100");
  const [startDateOffset, setStartDateOffset] = useState("today");
  const [patternLength, setPatternLength] = useState("60");
  const [yearsBack, setYearsBack] = useState("15");
  const [minWinPct, setMinWinPct] = useState("55");
  const [sortState, setSortState] = useState<SortState>({
    column: "rank",
    order: "asc",
  });

  // Fetch data with React Query v5
  const { data, isLoading, error } = useQuery({
    queryKey: ["screener", marketGroup, startDateOffset, patternLength, yearsBack, minWinPct],
    queryFn: () => fetchScreenerResults(marketGroup, startDateOffset, patternLength, yearsBack, minWinPct, "long"),
  });

  // Handle sort
  const handleSort = (column: string) => {
    setSortState((prev) => ({
      column,
      order: prev.column === column && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!data || !data.patterns) return [];
    
    return [...data.patterns].sort((a, b) => {
      if (sortState.column === null) return 0;
      
      const valueA = a[sortState.column as keyof typeof a];
      const valueB = b[sortState.column as keyof typeof b];
      
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
    { value: "7", label: "7 days" },
    { value: "15", label: "15 days" },
    { value: "30", label: "30 days" },
    { value: "60", label: "31-60 days" },
  ];
  const yearsBackOptions = [
    { value: "3", label: "3 years" },
    { value: "5", label: "5 years" },
    { value: "10", label: "10 years" },
    { value: "15", label: "15 years" },
    { value: "20", label: "20 years" },
    { value: "25", label: "25 years" },
    { value: "max", label: "Max" },
  ];
  const winPctOptions = Array.from({ length: 21 }, (_, i) => ({ 
    value: (i * 5).toString(), 
    label: `${i * 5}%` 
  }));

  // Table column headers with sort indicators
  const renderSortIndicator = (column: string) => {
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
            <Select value={yearsBack} onValueChange={setYearsBack}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select years" />
              </SelectTrigger>
              <SelectContent>
                {yearsBackOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Time Period:</label>
            <Select value={patternLength} onValueChange={setPatternLength}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Filter: Win %</label>
            <Select value={minWinPct} onValueChange={setMinWinPct}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select win %" />
              </SelectTrigger>
              <SelectContent>
                {winPctOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
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
              Found {data.patterns?.length || 0} patterns
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
                    onClick={() => handleSort("annualizedReturn")}
                  >
                    Annualized return{renderSortIndicator("annualizedReturn")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("averageReturn")}
                  >
                    Average return{renderSortIndicator("averageReturn")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("medianReturn")}
                  >
                    Median return{renderSortIndicator("medianReturn")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("patternStart")}
                  >
                    Pattern Start{renderSortIndicator("patternStart")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("patternEnd")}
                  >
                    Pattern End{renderSortIndicator("patternEnd")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("calendarDays")}
                  >
                    Cal. Days{renderSortIndicator("calendarDays")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("maxProfit")}
                  >
                    Max Profit{renderSortIndicator("maxProfit")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("maxLoss")}
                  >
                    Max Loss{renderSortIndicator("maxLoss")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("winners")}
                  >
                    No. of Winners{renderSortIndicator("winners")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("trades")}
                  >
                    No. of Trades{renderSortIndicator("trades")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("winRatio")}
                  >
                    Win Ratio{renderSortIndicator("winRatio")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("stdDev")}
                  >
                    Std Dev{renderSortIndicator("stdDev")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("sharpeRatio")}
                  >
                    Sharpe Ratio{renderSortIndicator("sharpeRatio")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((pattern) => (
                  <TableRow key={`${pattern.rank}-${pattern.symbol}`}>
                    <TableCell>{pattern.rank}</TableCell>
                    <TableCell className="font-medium">{pattern.symbol}</TableCell>
                    <TableCell>{pattern.instrument}</TableCell>
                    <TableCell className={pattern.annualizedReturn > 0 ? 'text-green-600' : 'text-red-600'}>
                      {typeof pattern.annualizedReturn === 'number' ? 
                        `${pattern.annualizedReturn > 0 ? '+' : ''}${pattern.annualizedReturn.toFixed(2)}%` : 
                        pattern.annualizedReturn}
                    </TableCell>
                    <TableCell className={pattern.averageReturn > 0 ? 'text-green-600' : 'text-red-600'}>
                      {typeof pattern.averageReturn === 'number' ?
                        `${pattern.averageReturn > 0 ? '+' : ''}${pattern.averageReturn.toFixed(2)}%` :
                        pattern.averageReturn}
                    </TableCell>
                    <TableCell className={pattern.medianReturn > 0 ? 'text-green-600' : 'text-red-600'}>
                      {typeof pattern.medianReturn === 'number' ? 
                        `${pattern.medianReturn > 0 ? '+' : ''}${pattern.medianReturn.toFixed(2)}%` : 
                        pattern.medianReturn}
                    </TableCell>
                    <TableCell>{pattern.patternStart}</TableCell>
                    <TableCell>{pattern.patternEnd}</TableCell>
                    <TableCell>{pattern.calendarDays}</TableCell>
                    <TableCell className="text-green-600">
                      {typeof pattern.maxProfit === 'number' ? `+${pattern.maxProfit.toFixed(2)}%` : pattern.maxProfit}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {typeof pattern.maxLoss === 'number' ? pattern.maxLoss.toFixed(2) + '%' : pattern.maxLoss}
                    </TableCell>
                    <TableCell>{pattern.winners}</TableCell>
                    <TableCell>{pattern.trades}</TableCell>
                    <TableCell>
                      {typeof pattern.winRatio === 'number' ? `${pattern.winRatio}%` : pattern.winRatio}
                    </TableCell>
                    <TableCell>{pattern.stdDev?.toFixed(2)}%</TableCell>
                    <TableCell>{pattern.sharpeRatio?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {(!data?.patterns || data.patterns.length === 0) && (
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

// The main component that provides the SeasonaxContext
const ScreenerPage = () => {
  return (
    <SeasonaxProvider>
      <ScreenerContent />
    </SeasonaxProvider>
  );
};

export default ScreenerPage;

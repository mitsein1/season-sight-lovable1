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
import {import React, { useState } from "react";
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
    // Convert '13 May' and '12 Jun' from "dd MMM" to "MM-dd"
    const isoStart = format(
      parse(pattern.pattern_start, "dd MMM", new Date()),
      "MM-dd"
    );
    const isoEnd = format(
      parse(pattern.pattern_end, "dd MMM", new Date()),
      "MM-dd"
    );

    navigate(
      `/dashboard?asset=${pattern.symbol}` +
      `&start_day=${isoStart}` +
      `&end_day=${isoEnd}` +
      `&years_back=${typeof yearsBack === 'number' ? yearsBack : 15}`
    );
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

  // Helper to render sort arrows
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
          {/* Market */}
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
          {/* Start Date */}
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
          {/* Years Back */}
          <div>
            <label className="text-sm font-medium mb-1 block">Examination period:</label>
            <Select
              value={String(yearsBack)}
              onValueChange={value => setYearsBack(value === 'max' ? 'max' : Number(value))}
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
          {/* Pattern Length */}
          <div>
            <label className="text-sm font-medium mb-1 block">Time Period:</label>
            <Select 
              value={patternLength.toString()} 
              onValueChange={val => setPatternLength(Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(opt => (
                  <SelectItem key={opt.value.toString()} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Min Win % */}
          <div>
            <label className="text-sm font-medium mb-1 block">Filter: Win %</label>
            <Select 
              value={minWinPct.toString()} 
              onValueChange={val => setMinWinPct(Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select win %" />
              </SelectTrigger>
              <SelectContent>
                {winPctOptions.map(opt => (
                  <SelectItem key={opt.value.toString()} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Direction (Long only) */}
          <div>
            <label className="text-sm font-medium mb-1 block">Direction:</label>
            <div className="flex items-center h-10 space-x-4 bg-gray-100 dark:bg-slate-700 rounded px-3">
              <label className="flex items-center space-x-2">
                <input type="radio" checked readOnly className="form-radio text-blue-600" />
                <span>Long</span>
              </label>
              <label className="flex items-center space-x-2 opacity-50">
                <input type="radio" disabled className="form-radio text-blue-600" />
                <span>Short</span>

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
    // Convert '13 May' and '12 Jun' from "dd MMM" to "MM-dd"
    const isoStart = format(
      parse(pattern.pattern_start, "dd MMM", new Date()),
      "MM-dd"
    );
    const isoEnd = format(
      parse(pattern.pattern_end, "dd MMM", new Date()),
      "MM-dd"
    );

    navigate(
      `/dashboard?asset=${pattern.symbol}` +
      `&start_day=${isoStart}` +
      `&end_day=${isoEnd}` +
      `&years_back=${typeof yearsBack === 'number' ? yearsBack : 15}`
    );
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

  // Helper to render sort arrows
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
          {/* Market */}
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
          {/* Start Date */}
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
          {/* Years Back */}
          <div>
            <label className="text-sm font-medium mb-1 block">Examination period:</label>
            <Select
              value={String(yearsBack)}
              onValueChange={value => setYearsBack(value === 'max' ? 'max' : Number(value))}
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
          {/* Pattern Length */}
          <div>
            <label className="text-sm font-medium mb-1 block">Time Period:</label>
            <Select 
              value={patternLength.toString()} 
              onValueChange={val => setPatternLength(Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(opt => (
                  <SelectItem key={opt.value.toString()} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Min Win % */}
          <div>
            <label className="text-sm font-medium mb-1 block">Filter: Win %</label>
            <Select 
              value={minWinPct.toString()} 
              onValueChange={val => setMinWinPct(Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select win %" />
              </SelectTrigger>
              <SelectContent>
                {winPctOptions.map(opt => (
                  <SelectItem key={opt.value.toString()} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Direction (Long only) */}
          <div>
            <label className="text-sm font-medium mb-1 block">Direction:</label>
            <div className="flex items-center h-10 space-x-4 bg-gray-100 dark:bg-slate-700 rounded px-3">
              <label className="flex items-center space-x-2">
                <input type="radio" checked readOnly className="form-radio text-blue-600" />
                <span>Long</span>
              </label>
              <label className="flex items-center space-x-2 opacity-50">
                <input type="radio" disabled className="form-radio text-blue-600" />
                <span>Short</span>

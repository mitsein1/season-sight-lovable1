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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type SortOrder = "asc" | "desc";

interface SortState {
  column: keyof ScreenerPattern | null;
  order: SortOrder;
}

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
    const isoStart = format(
      parse(pattern.pattern_start, "dd MMM", new Date()),
      "MM-dd"
    );
    const isoEnd = format(
      parse(pattern.pattern_end, "dd MMM", new Date()),
      "MM-dd"
    );
    const ybVal = typeof yearsBack === "number" ? yearsBack : 15;
    navigate(
      `/dashboard?asset=${pattern.symbol}` +
        `&start_day=${isoStart}` +
        `&end_day=${isoEnd}` +
        `&years_back=${ybVal}`
    );
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

  const renderSortIndicator = (col: keyof ScreenerPattern) =>
    sortState.column === col ? (sortState.order === "asc" ? " ↑" : " ↓") : null;

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
          </div>\``}]}

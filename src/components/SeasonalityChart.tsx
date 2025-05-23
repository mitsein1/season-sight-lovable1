
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSeasonalityRangeSmoothed } from "@/services/api";
import { useSeasonax } from "@/context/SeasonaxContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceArea
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function SeasonalitySmoothedChart() {
  const { asset, yearsBack, setDateRange, startDay, endDay } = useSeasonax();
  const [selecting, setSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [activeSelection, setActiveSelection] = useState<{start: string, end: string} | null>(null);

  // Always load full year data regardless of current date range
  const { data, isLoading, error } = useQuery({
    queryKey: ["seasonality-full", asset, yearsBack],
    queryFn: () => fetchSeasonalityRangeSmoothed(asset, yearsBack, "01-01", "12-31"),
    staleTime: 1000 * 60 * 60 // 1h cache
  });

  // Initialize active selection based on current date range
  React.useEffect(() => {
    if (startDay && endDay) {
      setActiveSelection({ start: startDay, end: endDay });
    }
  }, [startDay, endDay]);

  // Date selection handlers
  const startSelection = (date: string) => {
    setSelecting(true);
    setSelectionStart(date);
    setSelectionEnd(null);
  };

  const updateSelection = (date: string) => {
    if (selecting && selectionStart) {
      setSelectionEnd(date);
    }
  };

  const finishSelection = () => {
    if (selecting && selectionStart && selectionEnd) {
      // Format dates to MM-DD as expected by setDateRange
      const formatDateToMMDD = (dateStr: string) => {
        // Ensure we have MM-DD format
        const parts = dateStr.split("-");
        if (parts.length >= 2) {
          return `${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
        }
        return dateStr;
      };
      
      // Determine date order (start might be after end if dragging backwards)
      const start = new Date(`2000-${formatDateToMMDD(selectionStart)}`);
      const end = new Date(`2000-${formatDateToMMDD(selectionEnd)}`);
      
      // Set active selection for visual reference
      if (start <= end) {
        setActiveSelection({
          start: formatDateToMMDD(selectionStart),
          end: formatDateToMMDD(selectionEnd)
        });
        setDateRange(formatDateToMMDD(selectionStart), formatDateToMMDD(selectionEnd));
      } else {
        setActiveSelection({
          start: formatDateToMMDD(selectionEnd),
          end: formatDateToMMDD(selectionStart)
        });
        setDateRange(formatDateToMMDD(selectionEnd), formatDateToMMDD(selectionStart));
      }
      
      // Reset selection state
      setSelecting(false);
    }
  };

  // Handle mouse leaving the chart area
  const handleMouseLeave = () => {
    if (selecting) {
      finishSelection();
    }
  };

  if (isLoading) return <Skeleton className="h-[300px] w-full bg-slate-800" />;
  if (error || !data) return <div className="text-center py-8">Failed to load data</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 dark:text-white">Seasonality (Full Year)</h3>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Click and drag to select date range</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={data.dates.map((d, i) => ({ date: d, value: data.values[i] }))}
          onMouseDown={(e) => e?.activeLabel && startSelection(e.activeLabel)}
          onMouseMove={(e) => e?.activeLabel && updateSelection(e.activeLabel)}
          onMouseUp={finishSelection}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(d) => d} 
            interval={Math.ceil(data.dates.length/12)} 
            stroke="#6b7280" 
            className="dark:text-gray-300"
          />
          <YAxis 
            domain={[0, 100]} 
            tickFormatter={(v) => `${v.toFixed(0)}`} 
            stroke="#6b7280" 
            className="dark:text-gray-300"
          />
          <Tooltip 
            formatter={(v: number) => `${v.toFixed(1)}`} 
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false}
          />
          {selecting && selectionStart && selectionEnd && (
            <ReferenceArea 
              x1={selectionStart} 
              x2={selectionEnd} 
              fill="#10b981" 
              fillOpacity={0.2}
              stroke="#10b981"
            />
          )}
          {/* Display active selection if exists */}
          {!selecting && activeSelection && (
            <ReferenceArea 
              x1={activeSelection.start} 
              x2={activeSelection.end} 
              fill="#10b981" 
              fillOpacity={0.15}
              stroke="#10b981"
              strokeDasharray="3 3"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


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
  const { asset, yearsBack, setDateRange } = useSeasonax();
  const [selecting, setSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);

  // Sempre caricare i dati dell'intero anno indipendentemente dal range di date corrente
  const { data, isLoading, error } = useQuery({
    queryKey: ["seasonality-full", asset, yearsBack],
    queryFn: () => fetchSeasonalityRangeSmoothed(asset, yearsBack, "01-01", "12-31"),
    staleTime: 1000 * 60 * 60 // 1h cache
  });

  // Gestione della selezione delle date
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
      // Formatta le date nel formato MM-DD atteso da setDateRange
      const formatDateToMMDD = (dateStr: string) => {
        // Assumiamo che dateStr sia in formato MM-DD o nel formato restituito dall'API
        const parts = dateStr.split("-");
        if (parts.length >= 2) {
          return `${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
        }
        return dateStr;
      };
      
      // Determina quale data viene prima
      const startDate = selectionStart;
      const endDate = selectionEnd;
      
      // Converti le date in oggetti Date per confrontarle
      const start = new Date(`2000-${formatDateToMMDD(startDate)}`);
      const end = new Date(`2000-${formatDateToMMDD(endDate)}`);
      
      // Imposta il range di date nel context
      if (start <= end) {
        setDateRange(formatDateToMMDD(startDate), formatDateToMMDD(endDate));
      } else {
        setDateRange(formatDateToMMDD(endDate), formatDateToMMDD(startDate));
      }
      
      setSelecting(false);
    }
  };

  // Handle quando il mouse lascia il grafico
  const handleMouseLeave = () => {
    if (selecting) {
      finishSelection();
    }
  };

  if (isLoading) return <Skeleton className="h-[300px] w-full bg-slate-800" />;
  if (error || !data) return <div className="text-center py-8">Failed to load data</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Seasonality (Full Year)</h3>
      <div className="text-xs text-gray-500 mb-2">Click and drag to select date range</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={data.dates.map((d, i) => ({ date: d, value: data.values[i] }))}
          onMouseDown={(e) => e.activeLabel && startSelection(e.activeLabel)}
          onMouseMove={(e) => e.activeLabel && updateSelection(e.activeLabel)}
          onMouseUp={() => finishSelection()}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            tickFormatter={d => d} 
            interval={Math.ceil(data.dates.length/12)} 
            stroke="#6b7280" 
          />
          <YAxis 
            domain={[0, 100]} 
            tickFormatter={v => `${v.toFixed(0)}`} 
            stroke="#6b7280" 
          />
          <Tooltip 
            formatter={(v: number) => `${v.toFixed(1)}`} 
            labelFormatter={(label) => `Date: ${label}`}
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
              fillOpacity={0.1}
              stroke="#10b981"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

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

  // **STEPS 1+2: fetch sempre su 01-01→12-31**
  const { data, isLoading, error } = useQuery(
    ["seasonality-smoothed-fullyear", asset, yearsBack],
    () => fetchSeasonalityRangeSmoothed(asset, yearsBack, "01-01", "12-31"),
    { staleTime: 1000 * 60 * 60 }
  );

  // Stato locale per la selezione
  const [selStart, setSelStart] = useState<string | null>(null);
  const [selEnd,   setSelEnd]   = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);

  if (isLoading) return <Skeleton className="h-[300px] w-full bg-slate-800" />;
  if (error || !data) return <div className="text-center py-8">Errore nel caricamento</div>;

  // Prepara array { date, value }
  const chartData = data.dates.map((d,i) => ({ date: d, value: data.values[i] }));

  // HANDLER: inizio selezione
  const onMouseDown = (e: any) => {
    if (e?.activeLabel) {
      setSelStart(e.activeLabel);
      setSelEnd(null);
      setSelecting(true);
    }
  };
  // HANDLER: fine selezione
  const onMouseUp = (e: any) => {
    if (selecting && e?.activeLabel) {
      const a = selStart!, b = e.activeLabel;
      const [s,eMD] = a <= b ? [a,b] : [b,a];
      setSelStart(s);
      setSelEnd(eMD);
      setSelecting(false);
      // questo imposta GLOBALMENTE startDay/endDay per tutti i widget
      setDateRange(s, eMD);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date"
          interval={Math.ceil(chartData.length/10)}
          stroke="#6b7280"
        />
        <YAxis 
          domain={[0,100]} 
          stroke="#6b7280" 
          tickFormatter={v => `${v.toFixed(0)}`}
        />
        <Tooltip formatter={(v: number) => `${v.toFixed(1)}`} />
        
        {/* AREA COLORATA PER LA SELEZIONE */}
        {selStart && selEnd && (
          <ReferenceArea
            x1={selStart}
            x2={selEnd}
            strokeOpacity={0.3}
            fill="#10b981"
            fillOpacity={0.1}
          />
        )}

        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#10b981" 
          strokeWidth={2} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSeasonalityRangeSmoothed } from "@/services/api";
import { useSeasonax } from "@/context/SeasonaxContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function SeasonalitySmoothedChart() {
  const { asset, startDay, endDay, yearsBack } = useSeasonax();

  const { data, isLoading, error } = useQuery({
    queryKey: ["seasonality-smoothed", asset, yearsBack, startDay, endDay],
    queryFn: () => fetchSeasonalityRangeSmoothed(asset, yearsBack, startDay, endDay),
    staleTime: 1000 * 60 * 60 // 1h cache
  });

  if (isLoading) return <Skeleton className="h-[300px] w-full bg-slate-800" />;
  if (error || !data) return <div className="text-center py-8">Failed to load data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.dates.map((d,i) => ({ date: d, value: data.values[i] }))}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tickFormatter={d => d} interval={Math.ceil(data.dates.length/10)} stroke="#6b7280" />
        <YAxis domain={[0, 100]} tickFormatter={v => `${v.toFixed(0)}`} stroke="#6b7280" />
        <Tooltip formatter={(v: number) => `${v.toFixed(1)}`} />
        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

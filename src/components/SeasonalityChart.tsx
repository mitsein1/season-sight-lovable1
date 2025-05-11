
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchSeasonality } from "@/services/api";
import { useSeasonax } from "@/context/SeasonaxContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartData {
  date: string;
  value: number;
}

export default function SeasonalityChart() {
  const { asset, startDay, endDay, yearsBack } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChartData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchSeasonality(asset, yearsBack, startDay, endDay);
        
        if (result.dates && result.average_prices && 
            result.dates.length > 0 && 
            result.average_prices.length > 0) {
          
          // Map the API response to the chart data format and scale to percentage
          const chartData = result.dates.map((date, index) => ({
            date: date,
            value: result.average_prices[index] * 100
          }));
          
          setData(chartData);
        } else {
          setData([]);
          setError("No seasonality data available");
        }
      } catch (err) {
        console.error("Failed to fetch seasonality data:", err);
        setData([]);
        setError("Failed to load seasonality data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asset, yearsBack, startDay, endDay]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4 h-[300px] flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="rounded-lg border bg-card p-4 h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">{error || "No seasonality data available"}</p>
      </div>
    );
  }

  // Calculate the min and max values for reference
  const values = data.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const dataAverage = values.reduce((sum, val) => sum + val, 0) / values.length;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-lg font-semibold mb-2">Seasonality Analysis</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Average price patterns over the last {yearsBack} years
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }} 
            interval={30} 
            tickFormatter={(value) => value}
          />
          <YAxis 
            domain={[Math.max(0, dataAverage - 20), Math.min(100, dataAverage + 20)]} // More focused domain around the average value
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            tick={{ fontSize: 10 }}
            allowDecimals={true}
            tickCount={5} // Fewer ticks for cleaner look
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)}%`, "Average Price"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            dot={false} 
            strokeWidth={2}
            animationDuration={1000}
            activeDot={{ r: 4, strokeWidth: 1 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <div>Range: {min.toFixed(2)}% to {max.toFixed(2)}%</div>
        <div>Data averaged from {new Date().getFullYear() - yearsBack} to {new Date().getFullYear() - 1}</div>
      </div>
    </div>
  );
}

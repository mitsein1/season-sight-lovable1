
import { useEffect, useState } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchCumulativeProfit, CumulativeProfitItem } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { toast } from "sonner";

interface ChartPoint {
  year: number;
  cumulative: number;
}

export default function CumulativeProfitChart() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CumulativeProfitItem[] | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset state on new asset or date range
    setLoading(true);
    setData(null);
    setRetryCount(0);
    
    const loadData = async () => {
      try {
        console.log(`Fetching cumulative profit for ${asset} from ${startDay} to ${endDay}, yearsBack: ${yearsBack}`);
        const result = await fetchCumulativeProfit(asset, startDay, endDay);
        
        if (!result || result.length === 0) {
          console.log("No cumulative profit data returned");
          if (retryCount < 2) {
            setRetryCount(prev => prev + 1);
            return;
          } else {
            setData(null);
            setLoading(false);
            return;
          }
        }
        
        setData(result);

        // 1) Sort by year
        const sorted = [...result].sort((a, b) => a.year - b.year);

        // 2) Calculate cumulative
        let cum = 0;
        const cumulPoints: ChartPoint[] = sorted.map(({ year, cumulative_profit }) => {
          cum += cumulative_profit;              // accumulate
          return { year, cumulative: parseFloat(cum.toFixed(2)) };
        });

        // 3) Filter the last `yearsBack` years, INCLUDING the current year
        const currentYear = new Date().getFullYear();
        const filtered = cumulPoints.filter(pt => pt.year > currentYear - yearsBack);

        setChartData(filtered);
        setRetryCount(0);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch cumulative profit:", error);
        
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
        } else {
          toast.error("Failed to load cumulative profit data");
          setData(null);
          setLoading(false);
        }
      }
    };

    loadData();
    
    // Add a retry mechanism with setTimeout only if we're retrying
    const retryTimeout = retryCount > 0 && retryCount < 3 ? 
      setTimeout(() => loadData(), 1000) : null;
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
    
  }, [asset, startDay, endDay, yearsBack, refreshCounter, retryCount]);

  const formatYAxis = (value: number) => `${value.toFixed(2)}%`;
  const formatTooltip = (value: number) => [`${value.toFixed(2)}%`, "Cumulative"];

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm h-full">
      <CardHeader className="pb-2 pt-4 px-6">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Cumulative Profit ({startDay} – {endDay})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading && <div className="flex justify-center items-center h-64 text-slate-500 dark:text-slate-400">Loading...</div>}
        {!loading && (!data || data.length === 0) && (
          <div className="flex justify-center items-center h-64 text-slate-500 dark:text-slate-400">No data available</div>
        )}
        {!loading && data?.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  dataKey="cumulative"
                  tickFormatter={formatYAxis}
                  width={60}
                  tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={formatTooltip}
                  labelFormatter={(year) => `Year: ${year}`}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)'
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#3584e4"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

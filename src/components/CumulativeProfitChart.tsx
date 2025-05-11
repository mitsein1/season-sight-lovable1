
import { useEffect, useState } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchCumulativeProfit, CumulativeProfitItem } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { toast } from "sonner";

export default function CumulativeProfitChart() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Array<CumulativeProfitItem> | null>(null);
  const [chartData, setChartData] = useState<{ year: number; profit: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching cumulative profit for ${asset} from ${startDay} to ${endDay}`);
        const result = await fetchCumulativeProfit(asset, startDay, endDay);
        console.log("Received cumulative profit data:", result);
        setData(result);
        
        // Transform data for chart
        const formattedData = result.map(item => ({
          year: item.year,
          profit: item.cumulative_profit
        }));
        
        // Filter by yearsBack
        const currentYear = new Date().getFullYear();
        const filteredData = formattedData.filter(item => 
          item.year >= (currentYear - yearsBack)
        );
        
        console.log("Transformed and filtered chart data:", filteredData);
        setChartData(filteredData);
      } catch (error) {
        console.error("Failed to fetch cumulative profit:", error);
        toast.error("Failed to load cumulative profit data");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  const formatYAxis = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatTooltip = (value: number) => {
    return [`${value.toFixed(2)}%`, 'Profit'];
  };

  return (
    <Card className="seasonax-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Cumulative Profit ({startDay} - {endDay})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="flex justify-center items-center h-64">Loading...</div>}
        {!loading && !data && <div className="flex justify-center items-center h-64">No data available</div>}
        {!loading && data && data.length === 0 && <div className="flex justify-center items-center h-64">No data available</div>}
        {!loading && data && data.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12 }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  width={60}
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={(value) => `Year: ${value}`}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
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

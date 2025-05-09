
import { useEffect, useState } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchPriceSeries, PriceSeries } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function PriceChart() {
  const { asset, year, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PriceSeries | null>(null);
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchPriceSeries(asset, year);
        setData(result);
        
        // Transform data for chart
        const formattedData = result.date.map((date, index) => ({
          date: date,
          price: result.price[index],
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch price series:", error);
        toast.error("Failed to load price data");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asset, year, refreshCounter]);

  const formatYAxis = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const formatTooltip = (value: number) => {
    return [value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }), 'Price'];
  };

  return (
    <Card className="seasonax-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Price History - {asset} ({year})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="flex justify-center items-center h-64">Loading...</div>}
        {!loading && !data && <div className="flex justify-center items-center h-64">No data available</div>}
        {!loading && data && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    // Display abbreviated months
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }}
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
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#1a5fb4" 
                  dot={false} 
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

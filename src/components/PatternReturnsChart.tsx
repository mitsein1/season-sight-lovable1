
import { useEffect, useState } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchPatternReturns, PatternReturn } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { toast } from "sonner";

export default function PatternReturnsChart() {
  const { asset, startDay, endDay, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PatternReturn | null>(null);
  const [chartData, setChartData] = useState<{ year: number; return: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchPatternReturns(asset, startDay, endDay);
        setData(result);
        
        // Transform data for chart
        const formattedData = result.year.map((year, index) => ({
          year: year,
          return: result.return[index],
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch pattern returns:", error);
        toast.error("Failed to load pattern return data");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asset, startDay, endDay, refreshCounter]);

  const formatYAxis = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatTooltip = (value: number) => {
    return [`${value.toFixed(2)}%`, 'Return'];
  };

  return (
    <Card className="seasonax-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Pattern Returns ({startDay} - {endDay})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="flex justify-center items-center h-64">Loading...</div>}
        {!loading && !data && <div className="flex justify-center items-center h-64">No data available</div>}
        {!loading && data && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12 }}
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
                <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.return >= 0 ? "#2ec27e" : "#e01b24"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

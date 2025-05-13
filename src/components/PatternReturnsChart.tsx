import { useEffect, useState } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchPatternReturns } from "@/services/api";
import { PatternReturnItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { toast } from "sonner";

export default function PatternReturnsChart() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<PatternReturnItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPatternReturns(asset, startDay, endDay);
        const currentYear = new Date().getFullYear();
        setChartData(
          data.filter((item) => item.year >= currentYear - yearsBack)
        );
      } catch (e) {
        console.error(e);
        toast.error("Failed to load pattern returns");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  // Prepare data with maxRise (positive) and maxDrop (negative)
  const data = chartData.map((item) => ({
    year: item.year,
    maxRise: item.max_profit ?? 0,
    maxDrop:
      typeof item.max_loss === "number"
        ? (item.max_loss < 0 ? item.max_loss : -item.max_loss)
        : 0,
  }));

  const fmtAxis = (v: number) => `${v.toFixed(0)}%`;
  const fmtTip = (value: number, name: string) => [`${value.toFixed(2)}%`, name];

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm h-full">
      <CardHeader className="pb-2 pt-4 px-6">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Pattern Returns ({startDay}–{endDay})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading && (
          <div className="h-64 flex justify-center items-center text-slate-500 dark:text-slate-400">
            Loading…
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="h-64 flex justify-center items-center text-slate-500 dark:text-slate-400">
            No data
          </div>
        )}
        {!loading && data.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                />
                <YAxis
                  tickFormatter={fmtAxis}
                  width={60}
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={fmtTip}
                  labelFormatter={(y) => `Year: ${y}`}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Legend
                  verticalAlign="top"
                  height={24}
                  wrapperStyle={{ color: "var(--foreground)" }}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

                {/* Max Rise: light green */}
                <Bar
                  dataKey="maxRise"
                  name="Max Rise"
                  barSize={20}
                  fill="#bbf7d0" 
                  radius={[4, 4, 0, 0]}
                />

                {/* Max Drop: light red */}
                <Bar
                  dataKey="maxDrop"
                  name="Max Drop"
                  barSize={20}
                  fill="#fecaca"
                  radius={[0, 0, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

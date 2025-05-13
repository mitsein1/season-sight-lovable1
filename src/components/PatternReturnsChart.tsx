import { useEffect, useState } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchPatternStatistics, YearlyStatistic } from "@/services/api";
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
  Cell,
} from "recharts";
import { toast } from "sonner";

// Tipo dati per il chart: Profit, Max Rise e Max Drop per anno
interface PatternReturnsData {
  year:    number;
  profit:  number;
  maxRise: number;
  maxDrop: number;
}

export default function PatternReturnsChart() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<YearlyStatistic[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPatternStatistics(asset, startDay, endDay);
        const currentYear = new Date().getFullYear();
        setStats(
          data.filter(item => item.year >= currentYear - yearsBack)
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

  // Mappa i dati per Recharts
  const data: PatternReturnsData[] = stats.map(item => ({
    year:    item.year,
    profit:  item.profit_percentage ?? 0,
    maxRise: item.max_rise ?? 0,
    maxDrop: item.max_drop ?? 0,
  }));

  const fmtAxis = (value: number) => `${value.toFixed(0)}%`;
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
                  tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                />
                <YAxis
                  tickFormatter={fmtAxis}
                  width={60}
                  tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={fmtTip}
                  labelFormatter={year => `Year: ${year}`}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                {/* Legenda personalizzata colorata */}
                <Legend
                  verticalAlign="top"
                  height={24}
                  payload={[
                    { value: 'Profit', id: 'profit', type: 'square', color: '#2ec27e' },
                    { value: 'Max Rise', id: 'maxRise', type: 'square', color: '#bbf7d0' },
                    { value: 'Max Drop', id: 'maxDrop', type: 'square', color: '#fecaca' },
                  ]}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

                {/* Barra del profit (verde se positivo, rosso se negativo) */}
                <Bar dataKey="profit" name="Profit" barSize={20} fill="#2ec27e">
                  {data.map((entry, index) => (
                    <Cell
                      key={`profit-${index}`}
                      fill={entry.profit >= 0 ? '#2ec27e' : '#e01b24'}
                      radius={entry.profit >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]}
                    />
                  ))}
                </Bar>

                {/* Barre impilate: Max Rise e Max Drop */}
                <Bar
                  dataKey="maxRise"
                  name="Max Rise"
                  stackId="a"
                  barSize={20}
                  fill="#bbf7d0"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="maxDrop"
                  name="Max Drop"
                  stackId="a"
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

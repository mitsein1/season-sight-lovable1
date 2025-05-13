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
  TooltipProps,
} from "recharts";
import { toast } from "sonner";

// Tipo dati per il chart: profit, riseExt, dropExt, maxRise e maxDrop per anno
interface PatternReturnsData {
  year:     number;
  profit:   number;
  riseExt:  number;
  dropExt:  number;
  maxRise:  number;
  maxDrop:  number;
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

  // Mappa i dati per Recharts con estensioni e valori grezzi
  const data: PatternReturnsData[] = stats.map(item => {
    const profit    = item.profit_percentage ?? 0;
    const maxRise   = item.max_rise         ?? profit;
    const maxDrop   = item.max_drop         ?? profit;
    const riseExt   = profit > 0 ? Math.max(maxRise - profit, 0) : 0;
    const dropExt   = profit < 0 ? Math.min(maxDrop - profit, 0) : 0;
    return {
      year:    item.year,
      profit,
      riseExt,
      dropExt,
      maxRise,
      maxDrop,
    };
  });

  // Formatter per tooltip: mostra raw maxRise/maxDrop per le estensioni
  const fmtAxis = (value: number) => `${value.toFixed(0)}%`;
  const fmtTip = (
    value: number,
    name: string,
    props: TooltipProps<number, string>
  ) => {
    if (name === "Max Rise") {
      const v = props.payload?.maxRise;
      return v !== undefined ? [`${v.toFixed(2)}%`, name] : [`${value.toFixed(2)}%`, name];
    }
    if (name === "Max Drop") {
      const v = props.payload?.maxDrop;
      return v !== undefined ? [`${v.toFixed(2)}%`, name] : [`${value.toFixed(2)}%`, name];
    }
    // Profit
    return [`${(props.payload?.profit ?? value).toFixed(2)}%`, name];
  };

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
              <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--foreground)' }} />
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
                <Legend
                  verticalAlign="top"
                  height={24}
                  payload={[
                    { value: 'Max Drop', id: 'dropExt', type: 'square', color: '#fecaca' },
                    { value: 'Profit', id: 'profit', type: 'square', color: '#2ec27e' },
                    { value: 'Max Rise', id: 'riseExt', type: 'square', color: '#bbf7d0' },
                  ]}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

                {/* Stack: profit, dropExt, riseExt */}
                <Bar dataKey="profit" name="Profit" stackId="a" barSize={20}>
                  {data.map((entry, idx) => (
                    <Cell
                      key={`profit-${idx}`}
                      fill={entry.profit >= 0 ? '#2ec27e' : '#e01b24'}
                      radius={entry.profit >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]}
                    />
                  ))}
                </Bar>
                {data.some(d => d.dropExt !== 0) && (
                  <Bar dataKey="dropExt" name="Max Drop" stackId="a" barSize={20} fill="#fecaca" />
                )}
                {data.some(d => d.riseExt !== 0) && (
                  <Bar dataKey="riseExt" name="Max Rise" stackId="a" barSize={20} fill="#bbf7d0" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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

// Interfaccia interna per i dati
interface PatternReturnsData {
  year:    number;
  profit:  number;
  maxRise: number;
  maxDrop: number;
  riseExt: number;
  dropExt: number;
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

  // Mappatura dei dati inclusi gli spike
  const data: PatternReturnsData[] = stats.map(item => {
    const profit    = item.profit_percentage ?? 0;
    const maxRise   = item.max_rise         ?? profit;
    const maxDrop   = item.max_drop         ?? profit;
    const riseExt   = Math.max(maxRise - profit, 0);
    const dropExt   = Math.min(maxDrop - profit, 0);
    return { year: item.year, profit, maxRise, maxDrop, riseExt, dropExt };
  });

  const fmtAxis = (v: number) => `${v.toFixed(0)}%`;
  const fmtTip = (
    value: number,
    name: string,
    props: TooltipProps<number, string>
  ) => {
    const { payload } = props;
    if (name === 'Max Rise') {
      return [`${(payload?.maxRise ?? value).toFixed(2)}%`, name];
    }
    if (name === 'Max Drop') {
      return [`${(payload?.maxDrop ?? value).toFixed(2)}%`, name];
    }
    return [`${(payload?.profit ?? value).toFixed(2)}%`, name];
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
          <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
            Loading…
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
            No data
          </div>
        )}
        {!loading && data.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--foreground)' }} />
                <YAxis tickFormatter={fmtAxis} width={60} tick={{ fontSize: 12, fill: 'var(--foreground)' }} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={fmtTip}
                  labelFormatter={year => `Year: ${year}`}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
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

                {/* Lower wick */}
                <Bar dataKey="dropExt" name="Max Drop" stackId="a" barSize={20} fill="#fecaca" />

                {/* Body */}
                <Bar dataKey="profit" name="Profit" stackId="a" barSize={20}>
                  {data.map((d, i) => (
                    <Cell
                      key={`cell-profit-${i}`}
                      fill={d.profit >= 0 ? '#2ec27e' : '#e01b24'}
                      radius={d.profit >= 0 ? [4,4,0,0] : [0,0,4,4]}
                    />
                  ))}
                </Bar>

                {/* Upper wick */}
                <Bar dataKey="riseExt" name="Max Rise" stackId="a" barSize={20} fill="#bbf7d0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

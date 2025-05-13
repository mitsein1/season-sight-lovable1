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

// Tipologia dati per il componente
interface PatternReturnsData {
  year:    number;
  profit:  number; // profit percentage
  maxRise: number; // highest peak
  maxDrop: number; // lowest trough
  riseExt: number; // spike above profit
  dropExt: number; // spike below profit
}

export default function PatternReturnsChart() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<YearlyStatistic[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPatternStatistics(asset, startDay, endDay);
        const yearNow = new Date().getFullYear();
        setStats(data.filter(d => d.year >= yearNow - yearsBack));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load pattern returns");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  // Costruzione dei dati per il grafico
  const data: PatternReturnsData[] = stats.map(d => {
  const profit = d.profit_percentage ?? 0;
  const maxRise = d.max_rise ?? profit;
  const maxDrop = d.max_drop ?? profit;

  return {
    year: d.year,
    profitPos: profit > 0 ? profit : 0,
    profitNeg: profit < 0 ? profit : 0,
    riseExt: maxRise > profit && profit >= 0 ? maxRise - profit : (maxRise > 0 && profit < 0 ? maxRise : 0),
    dropExt: maxDrop < profit && profit <= 0 ? maxDrop - profit : (maxDrop < 0 && profit > 0 ? maxDrop : 0),
    maxRise,
    maxDrop,
  };
});


  // Formatter asse e tooltip
  const fmtAxis = (v: number) => `${v.toFixed(0)}%`;
  const fmtTip = (
    val: number,
    key: string,
    props: TooltipProps<number, string>
  ) => {
    const payload: any = props.payload;
    switch (key) {
      case "Max Rise":
        return [`${payload.maxRise.toFixed(2)}%`, key];
      case "Max Drop":
        return [`${payload.maxDrop.toFixed(2)}%`, key];
      default:
        return [`${payload.profit.toFixed(2)}%`, key];
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm h-full">
      <CardHeader className="px-6 pt-4 pb-2">
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
            No data available
          </div>
        )}
        {!loading && data.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <YAxis tickFormatter={fmtAxis} width={60} tick={{ fill: 'var(--foreground)', fontSize: 12 }} domain={['auto','auto']} />
                <Tooltip
                  formatter={fmtTip}
                  labelFormatter={(y) => `Year: ${y}`}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend
                  verticalAlign="top"
                  height={24}
                  payload={[
                    { value: 'Max Drop', id: 'dropExt', type: 'square', color: '#fecaca' },
                    { value: 'Profit',    id: 'profit',  type: 'square', color: '#2ec27e' },
                    { value: 'Max Rise', id: 'riseExt', type: 'square', color: '#bbf7d0' },
                  ]}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

                {/* spike inferiore */}
                <Bar dataKey="dropExt" name="Max Drop" stackId="a" barSize={20} fill="#fecaca" />

                {/* corpo principale */}
                <Bar dataKey="profit" name="Profit" stackId="a" barSize={20}>
                  {data.map((d, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={d.profit >= 0 ? '#2ec27e' : '#e01b24'}
                      radius={d.profit >= 0 ? [4,4,0,0] : [0,0,4,4]}
                    />
                  ))}
                </Bar>

                {/* spike superiore */}
                <Bar dataKey="riseExt" name="Max Rise" stackId="a" barSize={20} fill="#bbf7d0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

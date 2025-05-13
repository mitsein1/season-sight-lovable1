
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

interface ChartDataItem {
  year: number;
  profit: number;
  maxRise: number;
  maxDrop: number;
  profitColor: string;
  // Valori per la visualizzazione
  profitBar: number;     // Profit principale (rosso o verde)
  maxRiseBar: number;    // Rise extra oltre profit se c'è (giallo)
  maxDropBar: number;    // Drop extra sotto zero o sotto profit (rosa)
}

export default function PatternReturnsChart() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<YearlyStatistic[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchPatternStatistics(asset, startDay, endDay);
        const currentYear = new Date().getFullYear();
        setStats(data.filter(d => d.year >= currentYear - yearsBack));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load pattern returns");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  // Trasforma i dati per il chart
  const data: ChartDataItem[] = stats.map(d => {
    const profit = d.profit_percentage ?? 0;
    const maxRise = d.max_rise ?? profit;
    const maxDrop = d.max_drop ?? profit;
    
    let profitBar = profit;
    let maxRiseBar = 0;
    let maxDropBar = 0;
    
    // Caso profit positivo
    if (profit > 0) {
      // Se maxRise > profit, mostra l'extra sopra il profit
      maxRiseBar = maxRise > profit ? maxRise - profit : 0;
      // Mostra sempre il maxDrop (se è minore di zero)
      maxDropBar = Math.min(maxDrop, 0);
    } 
    // Caso profit negativo
    else {
      // Mostra sempre il maxRise (se è maggiore di zero)
      maxRiseBar = Math.max(maxRise, 0);
      // Se maxDrop < profit, mostra l'extra sotto il profit
      maxDropBar = maxDrop < profit ? maxDrop - profit : 0;
    }

    return {
      year: d.year,
      profit,
      maxRise,
      maxDrop,
      profitColor: profit >= 0 ? "#2ec27e" : "#e01b24", // Verde/Rosso
      profitBar,
      maxRiseBar,
      maxDropBar
    };
  });

  // Formatter per asse e tooltip
  const formatAxisValue = (value: number) => `${value.toFixed(0)}%`;
  const formatTooltip = (
    value: number,
    name: string,
    props: TooltipProps<number, string>
  ) => {
    if (!props?.payload) return [value.toFixed(2) + '%', name];
    
    const item = props.payload as unknown as ChartDataItem;
    
    if (name === 'Max Rise') return [`${item.maxRise.toFixed(2)}%`, name];
    if (name === 'Max Drop') return [`${item.maxDrop.toFixed(2)}%`, name];
    return [`${item.profit.toFixed(2)}%`, name];
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
        {!loading && !data.length && (
          <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
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
                  tick={{ fill: 'var(--foreground)', fontSize: 12 }} 
                />
                <YAxis 
                  tickFormatter={formatAxisValue} 
                  width={60} 
                  tick={{ fill: 'var(--foreground)', fontSize: 12 }} 
                  domain={['auto', 'auto']} 
                />
                <Tooltip
                  formatter={formatTooltip}
                  labelFormatter={(year) => `Year: ${year}`}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)' 
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  payload={[
                    { value: 'Max Drop', type: 'circle', color: '#ffb1c1' },
                    { value: 'Profit', type: 'circle', color: '#2ec27e' },
                    { value: 'Max Rise', type: 'circle', color: '#c1e73c' }
                  ]}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                
                {/* Barra Max Drop (rosa) */}
                <Bar 
                  dataKey="maxDropBar" 
                  name="Max Drop" 
                  stackId="a" 
                  fill="#ffb1c1" 
                  barSize={24}
                />
                
                {/* Barra Profit (verde/rossa) */}
                <Bar 
                  dataKey="profitBar" 
                  name="Profit" 
                  stackId="a" 
                  barSize={24}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.profitColor} 
                    />
                  ))}
                </Bar>
                
                {/* Barra Max Rise (giallo) */}
                <Bar 
                  dataKey="maxRiseBar" 
                  name="Max Rise" 
                  stackId="a" 
                  fill="#c1e73c" 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

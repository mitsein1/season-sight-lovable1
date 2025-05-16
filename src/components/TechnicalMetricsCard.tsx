import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchMiscMetrics } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MiscMetrics } from "@/types";
import { toast } from "sonner";

// Helper function to safely format numbers with toFixed
const safeToFixed = (value: number | undefined | null, digits: number = 2): string => {
  if (value === undefined || value === null) return "N/A";
  return value.toFixed(digits);
};

export default function TechnicalMetricsCard() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MiscMetrics | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching misc metrics for ${asset} with yearsBack: ${yearsBack}, startDay: ${startDay}, endDay: ${endDay}`);
        // API parameters order: asset, yearsBack, startDay, endDay
        const result = await fetchMiscMetrics(asset, yearsBack, startDay, endDay);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch misc metrics:", error);
        toast.error("Failed to load technical metrics");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm h-full">
      <CardHeader className="pb-2 pt-4 px-6">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Miscellaneous</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {loading ? (
          <div className="flex justify-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>
        ) : !data ? (
          <div className="flex justify-center py-8 text-slate-500 dark:text-slate-400">No data available</div>
        ) : (
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{data.trades}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Trades</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{data.current_streak}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Current streak</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{data.calendar_days}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Calendar days</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{safeToFixed(data.volatility)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Volatility</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{safeToFixed(data.sharpe_ratio)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Sharpe ratio</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{safeToFixed(data.sortino_ratio)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Sortino ratio</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{safeToFixed(data.std_dev)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Standard deviation</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

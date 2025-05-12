
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
        // CORREZIONE: yearsBack deve essere il secondo parametro
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
    <Card className="bg-white shadow-sm h-full">
      <CardHeader className="pb-2 pt-4 px-6">
        <CardTitle className="text-lg font-semibold text-slate-800">Miscellaneous</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {loading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : !data ? (
          <div className="flex justify-center py-8 text-slate-500">No data available</div>
        ) : (
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <div className="text-lg font-bold">{data.trades}</div>
              <div className="text-xs text-slate-500">Trades</div>
            </div>
            <div>
              <div className="text-lg font-bold">{data.current_streak}</div>
              <div className="text-xs text-slate-500">Current streak</div>
            </div>
            <div>
              <div className="text-lg font-bold">{data.calendar_days}</div>
              <div className="text-xs text-slate-500">Calendar days</div>
            </div>
            <div>
              <div className="text-lg font-bold">{safeToFixed(data.volatility)}</div>
              <div className="text-xs text-slate-500">Volatility</div>
            </div>
            <div>
              <div className="text-lg font-bold">{safeToFixed(data.sharpe_ratio)}</div>
              <div className="text-xs text-slate-500">Sharpe ratio</div>
            </div>
            <div>
              <div className="text-lg font-bold">{safeToFixed(data.sortino_ratio)}</div>
              <div className="text-xs text-slate-500">Sortino ratio</div>
            </div>
            <div>
              <div className="text-lg font-bold">{safeToFixed(data.std_dev)}</div>
              <div className="text-xs text-slate-500">Standard deviation</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

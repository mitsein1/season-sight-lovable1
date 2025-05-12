
import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchTradeStats } from "@/services/api";
import { TradeStats } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import TradeStatsPieChart from "./TradeStatsPieChart";

// Helper function to safely format numbers with toFixed
const safeToFixed = (value: number | undefined | null, digits: number = 2): string => {
  if (value === undefined || value === null) return "N/A";
  return value.toFixed(digits);
};

export default function TradeStatsCard() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TradeStats | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchTradeStats(asset, startDay, endDay, yearsBack);
        setData(result);
      } catch (e) {
        console.error("Failed to fetch trade stats:", e);
        toast.error("Error loading Trade Statistics");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  return (
    <Card className="bg-white shadow-sm dark:bg-slate-800 h-full">
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Trade Statistics</CardTitle>
        {loading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : !data ? (
          <div className="flex justify-center py-8 text-slate-500 dark:text-slate-400">No data available</div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md">
                <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Total</div>
                <div className="text-xl font-bold dark:text-white">{data.total_trades}</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md">
                <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Win Rate</div>
                <div className={`text-xl font-bold ${data.win_pct >= 50 ? "text-seasonax-positive" : "text-seasonax-negative"}`}>
                  {safeToFixed(data.win_pct)}%
                </div>
              </div>
            </div>
            
            <TradeStatsPieChart wins={data.wins} losses={data.losses} />
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-slate-500 dark:text-slate-400 text-xs">Wins</div>
                <div className="text-lg font-bold text-seasonax-positive">{data.wins}</div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 text-xs">Losses</div>
                <div className="text-lg font-bold text-seasonax-negative">{data.losses}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

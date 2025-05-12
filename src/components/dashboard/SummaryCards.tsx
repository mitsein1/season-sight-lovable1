
import { useSeasonax } from "@/context/SeasonaxContext";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { fetchProfitSummary, fetchGainsLosses, fetchMiscMetrics } from "@/services/api";
import { toast } from "sonner";

// Helper function to safely format numbers with toFixed
const safeToFixed = (value: number | undefined | null, digits: number = 2): string => {
  if (value === undefined || value === null) return "N/A";
  return value.toFixed(digits);
};

export default function SummaryCards() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [profitData, setProfitData] = useState<any>(null);
  const [gainsData, setGainsData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profitResult, gainsResult, metricsResult] = await Promise.all([
          fetchProfitSummary(asset, startDay, endDay),
          fetchGainsLosses(asset, startDay, endDay, yearsBack),
          fetchMiscMetrics(asset, yearsBack, startDay, endDay)
        ]);
        
        setProfitData(profitResult);
        setGainsData(gainsResult);
        setMetricsData(metricsResult);
      } catch (error) {
        console.error("Failed to fetch summary data:", error);
        toast.error("Failed to load summary data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Profit Card */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-500">Total Profit</h3>
            {loading ? (
              <div className="h-7 animate-pulse bg-slate-100 rounded"></div>
            ) : (
              <div className={`text-2xl font-bold ${profitData?.total_profit >= 0 ? 'text-seasonax-positive' : 'text-seasonax-negative'}`}>
                {profitData ? `${safeToFixed(profitData.total_profit)}%` : 'N/A'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Win Percentage Card */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-500">Win Rate</h3>
            {loading ? (
              <div className="h-7 animate-pulse bg-slate-100 rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-seasonax-positive">
                {gainsData ? `${safeToFixed(gainsData.gain_pct)}%` : 'N/A'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sharpe Ratio Card */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-500">Sharpe Ratio</h3>
            {loading ? (
              <div className="h-7 animate-pulse bg-slate-100 rounded"></div>
            ) : (
              <div className="text-2xl font-bold">
                {metricsData ? safeToFixed(metricsData.sharpe_ratio) : 'N/A'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Volatility Card */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-500">Volatility</h3>
            {loading ? (
              <div className="h-7 animate-pulse bg-slate-100 rounded"></div>
            ) : (
              <div className="text-2xl font-bold">
                {metricsData ? safeToFixed(metricsData.volatility) : 'N/A'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

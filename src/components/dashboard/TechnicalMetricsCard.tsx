
import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchMiscMetrics } from "@/services/api";
import MetricsCard from "@/components/MetricsCard";
import { MiscMetrics } from "@/types";
import { toast } from "sonner";

export default function TechnicalMetricsCard() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MiscMetrics | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchMiscMetrics(asset, startDay, endDay, yearsBack);
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
    <MetricsCard
      title="Technical Metrics"
      isLoading={loading}
      hasData={!!data}
      metrics={
        data
          ? [
              {
                label: "Number of Trades",
                value: data.trades,
                valueType: "neutral",
              },
              {
                label: "Trading Days",
                value: data.calendar_days,
                valueType: "neutral",
              },
              {
                label: "Std Deviation",
                value: data.std_dev?.toFixed(2),
                valueType: "neutral",
              },
              {
                label: "Sortino Ratio",
                value: data.sortino_ratio?.toFixed(2),
                valueType: data.sortino_ratio >= 0 ? "positive" : "negative",
              },
              {
                label: "Sharpe Ratio",
                value: data.sharpe_ratio?.toFixed(2),
                valueType: data.sharpe_ratio >= 0 ? "positive" : "negative",
              },
              {
                label: "Volatility",
                value: data.volatility?.toFixed(2),
                valueType: "neutral",
              },
              {
                label: "Current Streak",
                value: data.current_streak,
                valueType: data.current_streak >= 0 ? "positive" : "negative",
              },
            ]
          : []
      }
    />
  );
}

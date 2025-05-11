import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchGainsLosses } from "@/services/api";
import MetricsCard from "@/components/MetricsCard";
import { toast } from "sonner";

export default function GainsLossesCard() {
  const { asset, startDay, endDay, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    gains: number;
    losses: number;
    gain_pct: number;
    loss_pct: number;
    max_gain: number;
    max_loss: number;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchGainsLosses(asset, startDay, endDay);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch gains/losses:", error);
        toast.error("Failed to load gains/losses data");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asset, startDay, endDay, refreshCounter]);

  return (
    <MetricsCard
      title="Gains / Losses"
      isLoading={loading}
      hasData={!!data}
      metrics={
        data
          ? [
              {
                label: "Number of Gains",
                value: data.gains,
                valueType: "positive",
              },
              {
                label: "Number of Losses",
                value: data.losses,
                valueType: "negative",
              },
              {
                label: "Average Gain %",
                value: `${data.gain_pct.toFixed(2)}%`,
                valueType: data.gain_pct >= 0 ? "positive" : "negative",
              },
              {
                label: "Average Loss %",
                value: `${data.loss_pct.toFixed(2)}%`,
                valueType: data.loss_pct >= 0 ? "positive" : "negative",
              },
              {
                label: "Max Gain %",
                value: `${data.max_gain.toFixed(2)}%`,
                valueType: "positive",
              },
              {
                label: "Max Loss %",
                value: `${data.max_loss.toFixed(2)}%`,
                valueType: "negative",
              },
            ]
          : []
      }
    />
  );
}

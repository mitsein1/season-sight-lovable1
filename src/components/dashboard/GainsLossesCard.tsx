
import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchGainsLosses } from "@/services/api";
import MetricsCard from "@/components/MetricsCard";
import { toast } from "sonner";

export default function GainsLossesCard() {
  const { asset, startDay, endDay, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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
                value: data.number_of_gains,
                valueType: "positive",
              },
              {
                label: "Number of Losses",
                value: data.number_of_losses,
                valueType: "negative",
              },
              {
                label: "Profit Percentage",
                value: `${data.profit_percentage?.toFixed(2)}%`,
                valueType: data.profit_percentage >= 0 ? "positive" : "negative",
              },
              {
                label: "Max Profit",
                value: `${data.max_profit?.toFixed(2)}%`,
                valueType: "positive",
              },
              {
                label: "Max Loss",
                value: `${data.max_loss?.toFixed(2)}%`,
                valueType: "negative",
              },
            ]
          : []
      }
    />
  );
}

// src/components/TradeStatsCard.tsx

import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchTradeStats } from "@/services/api";
import MetricsCard from "@/components/MetricsCard";
import { TradeStats } from "@/types";         // assicuratevi che TradeStats abbia questi campi
import { toast } from "sonner";

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
        toast.error("Errore nel caricamento delle Trade Statistics");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  return (
    <MetricsCard
      title="Trade Statistics"
      isLoading={loading}
      hasData={!!data}
      metrics={
        data
          ? [
              {
                label: "Total Trades",
                value: data.total_trades,
                valueType: "neutral",
              },
              {
                label: "Winning Trades",
                value: data.winning_trades,
                valueType: "positive",
              },
              {
                label: "Losing Trades",
                value: data.losing_trades,
                valueType: "negative",
              },
              {
                label: "Win %",
                value: `${data.win_pct.toFixed(2)}%`,
                valueType: data.win_pct >= 0 ? "positive" : "negative",
              },
              {
                label: "Loss %",
                value: `${data.loss_pct.toFixed(2)}%`,
                valueType: data.loss_pct >= 0 ? "positive" : "negative",
              },
            ]
          : []
      }
    />
  );
}

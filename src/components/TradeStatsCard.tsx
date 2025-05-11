// src/components/TradeStatsCard.tsx
import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchTradeStats } from "@/services/api";
import MetricsCard from "@/components/MetricsCard";
import { toast } from "sonner";

export default function TradeStatsCard() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState<{
    total_trades: number;
    wins:         number;
    losses:       number;
    win_pct:      number;
    loss_pct:     number;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTradeStats(asset, startDay, endDay, yearsBack)
      .then(setData)
      .catch(err => {
        console.error("TradeStats error", err);
        toast.error("Impossibile caricare trade stats");
      })
      .finally(() => setLoading(false));
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  return (
    <MetricsCard
      title="Trade Statistics"
      isLoading={loading}
      hasData={!!data}
      metrics={
        data
          ? [
              { label: "Total Trades",   value: data.total_trades, valueType: "neutral" },
              { label: "Winning Trades", value: data.wins,         valueType: "positive" },
              { label: "Losing Trades",  value: data.losses,       valueType: "negative" },
              { label: "Win %",          value: `${data.win_pct}%`, valueType: "positive" },
              { label: "Loss %",         value: `${data.loss_pct}%`, valueType: "negative" },
            ]
          : []
      }
    />
  );
}

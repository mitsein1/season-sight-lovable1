
import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchProfitSummary } from "@/services/api";
import MetricsCard from "@/components/MetricsCard";
import { toast } from "sonner";

export default function ProfitSummaryCard() {
  const { asset, startDay, endDay, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset state on new asset or date range
    setLoading(true);
    setData(null);
    setRetryCount(0);
    
    const loadData = async () => {
      try {
        console.log(`Fetching profit summary for ${asset} from ${startDay} to ${endDay} (attempt ${retryCount + 1})`);
        const result = await fetchProfitSummary(asset, startDay, endDay);
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profit summary:", error);
        
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
        } else {
          toast.error("Failed to load profit data");
          setData(null);
          setLoading(false);
        }
      }
    };

    loadData();
    
    // Add a retry mechanism with setTimeout only if we're retrying
    const retryTimeout = retryCount > 0 && retryCount < 3 ? 
      setTimeout(() => loadData(), 1000) : null;
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
    
  }, [asset, startDay, endDay, refreshCounter, retryCount]);

  return (
    <MetricsCard
      title="Profit Summary"
      isLoading={loading}
      hasData={!!data}
      metrics={
        data
          ? [
              {
                label: "Total Profit",
                value: `${data.total_profit?.toFixed(2)}%`,
                valueType: data.total_profit >= 0 ? "positive" : "negative",
              },
              {
                label: "Average Profit",
                value: `${data.average_profit?.toFixed(2)}%`,
                valueType: data.average_profit >= 0 ? "positive" : "negative",
              },
            ]
          : []
      }
    />
  );
}

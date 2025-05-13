
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
    const loadData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching profit summary for ${asset} from ${startDay} to ${endDay} (attempt ${retryCount + 1})`);
        const result = await fetchProfitSummary(asset, startDay, endDay);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch profit summary:", error);
        
        // Only show toast on final retry
        if (retryCount >= 2) {
          toast.error("Failed to load profit data");
        } else {
          // Auto retry with a delay
          setRetryCount(prev => prev + 1);
          return; // Exit early to prevent setLoading(false)
        }
        
        setData(null);
      } finally {
        if (retryCount >= 2) {
          setLoading(false);
          setRetryCount(0);
        }
      }
    };

    loadData();
    
    // Add a retry mechanism with setTimeout if we're still retrying
    let retryTimeout: NodeJS.Timeout | null = null;
    if (retryCount < 3) {
      retryTimeout = setTimeout(() => {
        loadData();
      }, 1000); // 1 second retry delay
    }
    
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

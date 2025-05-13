
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSeasonax } from "@/context/SeasonaxContext";
import { useQuery } from "@tanstack/react-query";
import { fetchMarketGroups } from "@/services/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AssetInfoCard() {
  const { asset, setAsset } = useSeasonax();

  // Fetch market groups and flatten into a single list of assets
  const { data: marketGroups, isLoading } = useQuery({
    queryKey: ["market-groups"],
    queryFn: fetchMarketGroups,
    staleTime: 1000 * 60 * 60,
  });

  const allAssets = React.useMemo(() => {
    if (!marketGroups) return [];
    // Flatten and ensure unique assets to avoid key warnings
    const flattened = Object.values(marketGroups).flat();
    return Array.from(new Set(flattened)); // Remove duplicates
  }, [marketGroups]);

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm border-b-4 border-b-seasonax-primary">
      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Currently analyzing
          </div>
          <h1 className="text-2xl font-bold text-seasonax-primary dark:text-seasonax-secondary">
            {asset}
          </h1>
          <div className="text-xs text-muted-foreground dark:text-gray-400">
            Seasonality and pattern analysis
          </div>
        </div>
        <div className="mt-2 md:mt-0 flex items-center space-x-4">
          <Select value={asset} onValueChange={setAsset} disabled={isLoading}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {allAssets.map((ticker) => (
                <SelectItem key={ticker} value={ticker}>
                  {ticker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

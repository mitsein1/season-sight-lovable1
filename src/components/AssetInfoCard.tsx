
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSeasonax } from "@/context/SeasonaxContext";
import { availableAssets } from "@/services/api";

export default function AssetInfoCard() {
  const { asset } = useSeasonax();
  
  // Get full asset name from available assets
  const assetInfo = availableAssets.find(a => a.value === asset);
  
  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm border-b-4 border-b-seasonax-primary">
      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground dark:text-gray-400">Currently analyzing</div>
          <h1 className="text-2xl font-bold text-seasonax-primary dark:text-seasonax-secondary">{assetInfo?.label || asset}</h1>
          <div className="text-xs text-muted-foreground dark:text-gray-400">Seasonality and pattern analysis</div>
        </div>
        <div className="mt-2 md:mt-0 flex items-center">
          <div className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm">
            <span className="font-semibold text-seasonax-primary dark:text-seasonax-secondary">{asset}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

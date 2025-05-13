
import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { Card, CardContent } from "@/components/ui/card";
import ProfitSummaryCard from "@/components/dashboard/ProfitSummaryCard";

// Helper function to safely format numbers with toFixed
const safeToFixed = (value: number | undefined | null, digits: number = 2): string => {
  if (value === undefined || value === null) return "N/A";
  return value.toFixed(digits);
};

export default function SummaryCards() {
  const { asset } = useSeasonax();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProfitSummaryCard />
      <Card className="bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4 text-slate-800 dark:text-slate-100">Asset Information</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{asset}</div>
        </CardContent>
      </Card>
    </div>
  );
}

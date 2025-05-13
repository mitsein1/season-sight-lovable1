// src/pages/Dashboard.tsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSeasonax } from "@/context/SeasonaxContext";
import Navbar from "@/components/Navbar";
import MainCharts from "@/components/dashboard/MainCharts";
import PatternCharts from "@/components/dashboard/PatternCharts";
import SeasonalitySection from "@/components/dashboard/SeasonalitySection";
import StatsSection from "@/components/dashboard/StatsSection";
import TradeStatsCard from "@/components/TradeStatsCard";
import AssetInfoCard from "@/components/AssetInfoCard";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const {
    asset,
    setAsset,
    startDay,
    endDay,
    setDateRange,
    yearsBack,
    setYearsBack,
    refreshData
  } = useSeasonax();

  useEffect(() => {
    const a  = searchParams.get("asset");
    const sd = searchParams.get("start_day");
    const ed = searchParams.get("end_day");
    const yb = searchParams.get("years_back");

    let updated = false;

    if (a && a !== asset) {
      setAsset(a);
      updated = true;
    }

    if (sd && ed && (sd !== startDay || ed !== endDay)) {
      setDateRange(sd, ed);
      updated = true;
    }

    // Se years_back è un numero valido, lo settiamo;
    // se è "max" o non è parseable, lo ignoriamo (manteniamo il default)
    if (yb && yb !== "max") {
      const num = Number(yb);
      if (!isNaN(num) && num !== yearsBack) {
        setYearsBack(num);
        updated = true;
      }
    }

    if (updated) {
      // Forza refetch sui widget
      setTimeout(refreshData, 50);
    }
  }, [
    searchParams,
    asset, startDay, endDay, yearsBack,
    setAsset, setDateRange, setYearsBack, refreshData
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6"><AssetInfoCard /></div>
        <div className="mb-6"><MainCharts /></div>
        <div className="mb-6"><PatternCharts /></div>
        <div className="mb-6"><SeasonalitySection /></div>
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TradeStatsCard />
          <div className="lg:col-span-2"><StatsSection /></div>
        </div>
      </div>
    </div>
  );
}

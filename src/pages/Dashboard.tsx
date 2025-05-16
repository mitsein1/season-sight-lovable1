
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
    // We don't need to handle the instrument param here as it's used directly in AssetInfoCard

    let updated = false;

    if (a && a !== asset) {
      console.log(`Dashboard: Setting asset to ${a} (was ${asset})`);
      setAsset(a);
      updated = true;
    }

    if (sd && ed && (sd !== startDay || ed !== endDay)) {
      console.log(`Dashboard: Setting date range to ${sd}-${ed} (was ${startDay}-${endDay})`);
      setDateRange(sd, ed);
      updated = true;
    }

    // If years_back is a valid number, set it;
    // if it's "max" or not parseable, ignore it (maintain the default)
    if (yb && yb !== "max") {
      const num = Number(yb);
      if (!isNaN(num) && num !== yearsBack) {
        console.log(`Dashboard: Setting years back to ${num} (was ${yearsBack})`);
        setYearsBack(num);
        updated = true;
      }
    }

    if (updated) {
      // Force refetch on widgets
      console.log("Dashboard: Refreshing data due to URL parameter changes");
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

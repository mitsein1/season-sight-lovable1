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
  // Get query params from URL
  const [searchParams] = useSearchParams();
  const {
    setAsset,
    setDateRange,
    setYearsBack,
    refreshData
  } = useSeasonax();

  useEffect(() => {
    const assetParam = searchParams.get("asset");
    const startParam = searchParams.get("start_day");
    const endParam = searchParams.get("end_day");
    const yearsParam = searchParams.get("years_back");

    let updated = false;

    if (assetParam) {
      setAsset(assetParam);
      updated = true;
    }
    if (startParam && endParam) {
      setDateRange(startParam, endParam);
      updated = true;
    }
    if (yearsParam) {
      // handle "max" or numeric
      setYearsBack(yearsParam === "max" ? yearsParam : Number(yearsParam));
      updated = true;
    }

    if (updated) {
      // trigger data refresh after context update
      refreshData();
    }
  }, [searchParams, setAsset, setDateRange, setYearsBack, refreshData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <AssetInfoCard />
        </div>
        <div className="mb-6">
          <MainCharts />
        </div>
        <div className="mb-6">
          <PatternCharts />
        </div>
        <div className="mb-6">
          <SeasonalitySection />
        </div>
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TradeStatsCard />
          <div className="lg:col-span-2">
            <StatsSection />
          </div>
        </div>
      </div>
    </div>
  );
}

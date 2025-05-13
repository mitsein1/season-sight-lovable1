
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSeasonax } from "@/context/SeasonaxContext";
import Navbar from "@/components/Navbar";
import MainCharts from "@/components/dashboard/MainCharts";
import PatternCharts from "@/components/dashboard/PatternCharts";
import SeasonalitySection from "@/components/dashboard/SeasonalitySection";
import StatsSection from "@/components/dashboard/StatsSection";
import TradeStatsCard from "@/components/TradeStatsCard";
import AssetInfoCard from "@/components/AssetInfoCard";

interface LocationState {
  asset?: string;
  startDay?: string;
  endDay?: string;
  yearsBack?: number;
}

export default function Dashboard() {
  const location = useLocation();
  const { setAsset, setDateRange, setYearsBack, refreshData } = useSeasonax();
  
  // Apply navigation state if available
  useEffect(() => {
    const state = location.state as LocationState | null;
    
    if (state) {
      const { asset, startDay, endDay, yearsBack } = state;
      
      let updatedState = false;
      
      if (asset) {
        setAsset(asset);
        updatedState = true;
      }
      
      if (startDay && endDay) {
        setDateRange(startDay, endDay);
        updatedState = true;
      }
      
      if (yearsBack && typeof yearsBack === 'number') {
        setYearsBack(yearsBack);
        updatedState = true;
      }
      
      // Refresh data if any state was updated
      if (updatedState) {
        refreshData();
        
        // Clear the location state to prevent re-applying on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, setAsset, setDateRange, setYearsBack, refreshData]);

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

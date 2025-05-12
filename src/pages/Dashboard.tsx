
import Navbar from "@/components/Navbar";
import MainCharts from "@/components/dashboard/MainCharts";
import PatternCharts from "@/components/dashboard/PatternCharts";
import SeasonalitySection from "@/components/dashboard/SeasonalitySection";
import StatsSection from "@/components/dashboard/StatsSection";
import TradeStatsCard from "@/components/TradeStatsCard";
import AssetInfoCard from "@/components/AssetInfoCard";

export default function Dashboard() {
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

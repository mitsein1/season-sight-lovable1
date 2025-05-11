
import Navbar from "@/components/Navbar";
import MainCharts from "@/components/dashboard/MainCharts";
import PatternCharts from "@/components/dashboard/PatternCharts";
import SeasonalitySection from "@/components/dashboard/SeasonalitySection";
import StatsSection from "@/components/dashboard/StatsSection";
import TradeStatsCard     from "@/components/TradeStatsCard";
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <MainCharts />
        <PatternCharts />
        <SeasonalitySection />
        <StatsSection />
      </div>
    </div>
  );
}


import StatisticsTable from "@/components/StatisticsTable";
import GainsLossesCard from "./GainsLossesCard";
import TechnicalMetricsCard from "./TechnicalMetricsCard";
import TradeStatsCard from "@/components/TradeStatsCard";
export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2">
        <StatisticsTable />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <GainsLossesCard />
        <TechnicalMetricsCard />
      </div>
    </div>
  );
}


import PatternReturnsChart from "@/components/PatternReturnsChart";
import ProfitSummaryCard from "./ProfitSummaryCard";

export default function PatternCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2">
        <PatternReturnsChart />
      </div>
      <div>
        <ProfitSummaryCard />
      </div>
    </div>
  );
}

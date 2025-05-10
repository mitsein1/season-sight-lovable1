
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PriceChart from "@/components/PriceChart";
import CumulativeProfitChart from "@/components/CumulativeProfitChart";
import PatternReturnsChart from "@/components/PatternReturnsChart";
import StatisticsTable from "@/components/StatisticsTable";
import MetricsCard from "@/components/MetricsCard";
import SeasonalityChart from "@/components/SeasonalityChart";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchProfitSummary, fetchGainsLosses, fetchMiscMetrics } from "@/services/api";

export default function Dashboard() {
  const { asset, startDay, endDay, yearsBack, refreshCounter } = useSeasonax();
  
  const [profitLoading, setProfitLoading] = useState(true);
  const [profitData, setProfitData] = useState<any>(null);
  
  const [gainsLoading, setGainsLoading] = useState(true);
  const [gainsData, setGainsData] = useState<any>(null);
  
  const [miscLoading, setMiscLoading] = useState(true);
  const [miscData, setMiscData] = useState<any>(null);

  useEffect(() => {
    const loadProfitData = async () => {
      setProfitLoading(true);
      try {
        // Use MM-DD format directly
        const result = await fetchProfitSummary(asset, startDay, endDay);
        setProfitData(result);
      } catch (error) {
        console.error("Failed to fetch profit summary:", error);
        setProfitData(null);
      } finally {
        setProfitLoading(false);
      }
    };

    const loadGainsData = async () => {
      setGainsLoading(true);
      try {
        // Use MM-DD format directly
        const result = await fetchGainsLosses(asset, startDay, endDay);
        setGainsData(result);
      } catch (error) {
        console.error("Failed to fetch gains/losses:", error);
        setGainsData(null);
      } finally {
        setGainsLoading(false);
      }
    };

    const loadMiscData = async () => {
      setMiscLoading(true);
      try {
        // Pass years_back as an additional parameter
        const result = await fetchMiscMetrics(asset, startDay, endDay, yearsBack);
        setMiscData(result);
      } catch (error) {
        console.error("Failed to fetch misc metrics:", error);
        setMiscData(null);
      } finally {
        setMiscLoading(false);
      }
    };

    loadProfitData();
    loadGainsData();
    loadMiscData();
  }, [asset, startDay, endDay, yearsBack, refreshCounter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PriceChart />
          </div>
          <div>
            <CumulativeProfitChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PatternReturnsChart />
          </div>
          <div>
            <MetricsCard
              title="Profit Summary"
              isLoading={profitLoading}
              hasData={!!profitData}
              metrics={
                profitData
                  ? [
                      {
                        label: "Total Profit",
                        value: `${profitData.total_profit?.toFixed(2)}%`,
                        valueType: profitData.total_profit >= 0 ? "positive" : "negative",
                      },
                      {
                        label: "Average Profit",
                        value: `${profitData.average_profit?.toFixed(2)}%`,
                        valueType: profitData.average_profit >= 0 ? "positive" : "negative",
                      },
                    ]
                  : []
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 mb-6">
          <SeasonalityChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <StatisticsTable />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <MetricsCard
              title="Gains / Losses"
              isLoading={gainsLoading}
              hasData={!!gainsData}
              metrics={
                gainsData
                  ? [
                      {
                        label: "Number of Gains",
                        value: gainsData.number_of_gains,
                        valueType: "positive",
                      },
                      {
                        label: "Number of Losses",
                        value: gainsData.number_of_losses,
                        valueType: "negative",
                      },
                      {
                        label: "Profit Percentage",
                        value: `${gainsData.profit_percentage?.toFixed(2)}%`,
                        valueType: gainsData.profit_percentage >= 0 ? "positive" : "negative",
                      },
                      {
                        label: "Max Profit",
                        value: `${gainsData.max_profit?.toFixed(2)}%`,
                        valueType: "positive",
                      },
                      {
                        label: "Max Loss",
                        value: `${gainsData.max_loss?.toFixed(2)}%`,
                        valueType: "negative",
                      },
                    ]
                  : []
              }
            />

            <MetricsCard
              title="Technical Metrics"
              isLoading={miscLoading}
              hasData={!!miscData}
              metrics={
                miscData
                  ? [
                      {
                        label: "Number of Trades",
                        value: miscData.number_of_trades,
                        valueType: "neutral",
                      },
                      {
                        label: "Trading Days",
                        value: miscData.trading_days,
                        valueType: "neutral",
                      },
                      {
                        label: "Std Deviation",
                        value: miscData.std_deviation?.toFixed(2),
                        valueType: "neutral",
                      },
                      {
                        label: "Sortino Ratio",
                        value: miscData.sortino_ratio?.toFixed(2),
                        valueType: miscData.sortino_ratio >= 0 ? "positive" : "negative",
                      },
                      {
                        label: "Sharpe Ratio",
                        value: miscData.sharpe_ratio?.toFixed(2),
                        valueType: miscData.sharpe_ratio >= 0 ? "positive" : "negative",
                      },
                      {
                        label: "Volatility",
                        value: miscData.volatility?.toFixed(2),
                        valueType: "neutral",
                      },
                      {
                        label: "Current Streak",
                        value: miscData.current_streak,
                        valueType: miscData.current_streak >= 0 ? "positive" : "negative",
                      },
                    ]
                  : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

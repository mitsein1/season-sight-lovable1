
import { useEffect, useState } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { fetchPatternStatistics, YearlyStatistic } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function StatisticsTable() {
  const { asset, startDay, endDay, refreshCounter } = useSeasonax();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<YearlyStatistic[] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchPatternStatistics(asset, startDay, endDay);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch pattern statistics:", error);
        toast.error("Failed to load statistical data");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asset, startDay, endDay, refreshCounter]);

  return (
    <Card className="seasonax-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Yearly Statistics ({startDay} - {endDay})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="flex justify-center items-center h-64">Loading...</div>}
        {!loading && (!data || data.length === 0) && (
          <div className="flex justify-center items-center h-64">
            No data available
          </div>
        )}
        {!loading && data && data.length > 0 && (
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-16">Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Start Price</TableHead>
                  <TableHead className="text-right">End Price</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Profit %</TableHead>
                  <TableHead className="text-right">Max Rise</TableHead>
                  <TableHead className="text-right">Max Drop</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell className="font-medium">{row.year}</TableCell>
                    <TableCell>{row.start_date}</TableCell>
                    <TableCell>{row.end_date}</TableCell>
                    <TableCell className="text-right">
                      {row.start_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.end_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.profit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className={`text-right ${row.profit_percentage >= 0 ? 'positive-value' : 'negative-value'}`}>
                      {row.profit_percentage.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right positive-value">
                      {row.max_rise.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right negative-value">
                      {row.max_drop.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

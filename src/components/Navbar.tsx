
import { useState } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import AssetSelector from "./AssetSelector";
import DateRangePicker from "./DateRangePicker";
import YearsBackSelector from "./YearsBackSelector";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCSV } from "@/services/api";
import { useLocation } from "react-router-dom";
import MainNavigation from "./MainNavigation";

export default function Navbar() {
  const { asset, startDay, endDay } = useSeasonax();
  const [isDownloading, setIsDownloading] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCSV(asset, startDay, endDay);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <>
      <MainNavigation />
      
      {isDashboard && (
        <div className="border-b bg-white dark:bg-slate-900 py-3 px-4 shadow-sm">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center justify-end gap-4">
              <AssetSelector />
              <DateRangePicker />
              <YearsBackSelector />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

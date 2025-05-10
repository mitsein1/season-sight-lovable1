
import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DateRangePicker() {
  const { startDay, endDay, setDateRange, refreshData } = useSeasonax();
  
  // Parse the initial values from context (MM-DD format)
  const [startMonth, setStartMonth] = useState(startDay.split("-")[0] || "01");
  const [startDayValue, setStartDayValue] = useState(startDay.split("-")[1] || "01");
  const [endMonth, setEndMonth] = useState(endDay.split("-")[0] || "01");
  const [endDayValue, setEndDayValue] = useState(endDay.split("-")[1] || "31");
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return { value: month, label: getMonthName(month) };
  });
  
  // Get days in month
  const getDaysInMonth = (month: string) => {
    const daysMap: Record<string, number> = {
      "01": 31, "02": 29, "03": 31, "04": 30, 
      "05": 31, "06": 30, "07": 31, "08": 31,
      "09": 30, "10": 31, "11": 30, "12": 31
    };
    return daysMap[month] || 31;
  };
  
  // Generate day options based on selected month
  const generateDayOptions = (month: string) => {
    const daysInMonth = getDaysInMonth(month);
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = (i + 1).toString().padStart(2, "0");
      return { value: day, label: day };
    });
  };
  
  // Helper function to get month name
  function getMonthName(month: string): string {
    const monthNames = [
      "Gennaio", "Febbraio", "Marzo", "Aprile", 
      "Maggio", "Giugno", "Luglio", "Agosto",
      "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    return monthNames[parseInt(month, 10) - 1];
  }
  
  // Convert selections to numeric keys for comparison
  const validateDateRange = () => {
    const startKey = parseInt(`${startMonth}${startDayValue}`, 10);
    const endKey = parseInt(`${endMonth}${endDayValue}`, 10);
    
    if (startKey > endKey) {
      setError("La data di inizio deve essere prima della data di fine");
      return false;
    }
    
    setError(null);
    return true;
  };
  
  // Update the context when selections change
  useEffect(() => {
    if (validateDateRange()) {
      // Directly use MM-DD format strings without any conversion
      const formattedStart = `${startMonth}-${startDayValue}`;
      const formattedEnd = `${endMonth}-${endDayValue}`;
      setDateRange(formattedStart, formattedEnd);
      refreshData();
    }
  }, [startMonth, startDayValue, endMonth, endDayValue, setDateRange, refreshData]);

  return (
    <div className="flex items-center gap-2">
      <span className="seasonax-label">Periodo:</span>
      <div className="flex items-center gap-2">
        {/* Start Date Selectors */}
        <div className="flex items-center gap-1">
          <Select value={startMonth} onValueChange={setStartMonth}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Mese" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={startDayValue} onValueChange={setStartDayValue}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Giorno" />
            </SelectTrigger>
            <SelectContent>
              {generateDayOptions(startMonth).map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span>-</span>

        {/* End Date Selectors */}
        <div className="flex items-center gap-1">
          <Select value={endMonth} onValueChange={setEndMonth}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Mese" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={endDayValue} onValueChange={setEndDayValue}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Giorno" />
            </SelectTrigger>
            <SelectContent>
              {generateDayOptions(endMonth).map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

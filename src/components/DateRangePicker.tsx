
import { useState, useEffect } from "react";
import { useSeasonax } from "@/context/SeasonaxContext";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DateRangePicker() {
  const { startDay, endDay, setDateRange, refreshData } = useSeasonax();
  const [startDate, setStartDate] = useState<Date | undefined>(
    parse(startDay, "MM-dd", new Date())
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    parse(endDay, "MM-dd", new Date())
  );

  useEffect(() => {
    // Update the context when dates change
    if (startDate && endDate) {
      const formattedStart = format(startDate, "MM-dd");
      const formattedEnd = format(endDate, "MM-dd");
      setDateRange(formattedStart, formattedEnd);
      refreshData();
    }
  }, [startDate, endDate, setDateRange, refreshData]);

  return (
    <div className="flex items-center gap-2">
      <span className="seasonax-label">Period:</span>
      <div className="flex items-center gap-2">
        {/* Start Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="pl-3 w-[120px] justify-start"
            >
              {startDate ? format(startDate, "MMM dd") : "Start"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              disabled={(date) => date > endDate!}
              month={startDate}
              weekStartsOn={1}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <span>-</span>

        {/* End Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="pl-3 w-[120px] justify-start"
            >
              {endDate ? format(endDate, "MMM dd") : "End"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(date) => date < startDate!}
              month={endDate}
              weekStartsOn={1}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { PeriodType } from "@/gen/arian/v1/enums_pb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType, customDates?: { start: Date; end: Date }) => void;
}

const periods = [
  { label: "7d", value: PeriodType.PERIOD_TYPE_7_DAYS },
  { label: "30d", value: PeriodType.PERIOD_TYPE_30_DAYS },
  { label: "90d", value: PeriodType.PERIOD_TYPE_90_DAYS },
] as const;

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: date, end: undefined });
    } else {
      const newEnd = date >= dateRange.start ? date : dateRange.start;
      const newStart = date >= dateRange.start ? dateRange.start : date;
      setDateRange({ start: newStart, end: newEnd });
      onChange(PeriodType.PERIOD_TYPE_CUSTOM, { start: newStart, end: newEnd });
      setIsCalendarOpen(false);
    }
  };

  const isCustom = value === PeriodType.PERIOD_TYPE_CUSTOM;
  const customLabel =
    dateRange.start && dateRange.end
      ? `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d")}`
      : "Custom";

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center rounded-xs border border-input bg-input p-0.5 text-muted-foreground">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onChange(period.value)}
            className={cn(
              "px-2.5 py-1 text-xs font-normal rounded-xs transition-all",
              value === period.value && "bg-background text-foreground",
              value !== period.value && "hover:text-foreground"
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="text-xs">{customLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-3 border-b">
            <p className="text-sm">Select date range</p>
            <p className="text-xs text-muted-foreground mt-1">
              {dateRange.start
                ? dateRange.end
                  ? "Range selected"
                  : "Select end date"
                : "Select start date"}
            </p>
          </div>
          <Calendar
            mode="single"
            selected={dateRange.start}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.ComponentProps<"div"> {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(
    date
  )

  React.useEffect(() => {
    setSelectedRange(date)
  }, [date])

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    onDateChange?.(range)
  }

  const quickSelect = (days: number) => {
    const end = new Date()
    const start = addDays(end, -days + 1)
    const range = { from: start, to: end }
    setSelectedRange(range)
    onDateChange?.(range)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, "LLL dd, y")} -{" "}
                  {format(selectedRange.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedRange?.from}
            selected={selectedRange}
            onSelect={handleDateSelect}
            numberOfMonths={1}
          />
          <div className="p-3 border-t">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickSelect(7)}
                className="text-xs"
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickSelect(30)}
                className="text-xs"
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickSelect(90)}
                className="text-xs"
              >
                Last 3 months
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface DateFilterProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
}

export function DateFilter({ date, onDateChange }: DateFilterProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate)
    setOpen(false)
  }

  const clearDate = () => {
    onDateChange(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>All dates</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleSelect} initialFocus />
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" onClick={clearDate} className="w-full">
            Clear filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

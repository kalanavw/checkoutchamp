
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Modified interface to fix the TypeScript error
interface DatePickerProps {
  date?: Date
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  selected,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  className,
  ...props
}: DatePickerProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Use either date or selected (for backward compatibility)
  const selectedDate = date || selected
  const setSelectedDate = onSelect

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate?.(date)
              setIsOpen(false)
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

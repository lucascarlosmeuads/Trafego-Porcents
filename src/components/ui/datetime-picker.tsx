
import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Selecione data e hora",
  className,
  disabled = false
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : ""
  )

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return
    
    // Preserve existing time if available
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours())
      newDate.setMinutes(selectedDate.getMinutes())
    }
    
    setSelectedDate(newDate)
    onDateChange(newDate)
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value
    setTimeValue(time)
    
    if (!selectedDate) {
      const newDate = new Date()
      const [hours, minutes] = time.split(":")
      newDate.setHours(parseInt(hours, 10))
      newDate.setMinutes(parseInt(minutes, 10))
      setSelectedDate(newDate)
      onDateChange(newDate)
    } else {
      const newDate = new Date(selectedDate)
      const [hours, minutes] = time.split(":")
      newDate.setHours(parseInt(hours, 10))
      newDate.setMinutes(parseInt(minutes, 10))
      setSelectedDate(newDate)
      onDateChange(newDate)
    }
  }

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP", { locale: ptBR })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="time" className="text-sm">Horário:</Label>
        <Input
          id="time"
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          className="w-32"
          disabled={disabled}
        />
      </div>
      
      {selectedDate && (
        <p className="text-xs text-muted-foreground">
          Data selecionada: {format(selectedDate, "PPP 'às' HH:mm", { locale: ptBR })}
        </p>
      )}
    </div>
  )
}

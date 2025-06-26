
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, RefreshCw } from 'lucide-react'

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void
  onRefresh: () => void
  loading?: boolean
}

export function DateRangeFilter({ onDateRangeChange, onRefresh, loading }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(() => {
    // Padrão: últimos 7 dias
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  })
  
  const [endDate, setEndDate] = useState(() => {
    // Padrão: hoje
    return new Date().toISOString().split('T')[0]
  })

  const handleQuickSelect = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    
    setStartDate(startStr)
    setEndDate(endStr)
    onDateRangeChange(startStr, endStr)
  }

  const handleCustomRange = () => {
    onDateRangeChange(startDate, endDate)
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtros de Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(1)}
            className="text-white border-gray-700"
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(7)}
            className="text-white border-gray-700"
          >
            7 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(30)}
            className="text-white border-gray-700"
          >
            30 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect(90)}
            className="text-white border-gray-700"
          >
            90 dias
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-white">Data Inicial</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-white">Data Final</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleCustomRange}
            className="flex-1"
            disabled={loading}
          >
            Aplicar Filtro
          </Button>
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={loading}
            className="border-gray-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

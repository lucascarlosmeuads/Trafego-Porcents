import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Palette } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type ColorMarcacao = 'laranja' | 'azul' | 'roxo' | 'verde' | 'rosa' | null

interface ColorSelectProps {
  value: ColorMarcacao
  onValueChange: (value: ColorMarcacao) => void
  disabled?: boolean
  isUpdating?: boolean
}

const CORES_MARCACAO = [
  { value: 'laranja', label: 'Laranja', color: 'bg-orange-500' },
  { value: 'azul', label: 'Azul', color: 'bg-blue-500' },
  { value: 'roxo', label: 'Roxo', color: 'bg-purple-500' },
  { value: 'verde', label: 'Verde', color: 'bg-green-500' },
  { value: 'rosa', label: 'Rosa', color: 'bg-pink-500' }
] as const

const getColorStyle = (cor: ColorMarcacao): string => {
  switch (cor) {
    case 'laranja': return 'bg-orange-500 hover:bg-orange-600'
    case 'azul': return 'bg-blue-500 hover:bg-blue-600'
    case 'roxo': return 'bg-purple-500 hover:bg-purple-600'
    case 'verde': return 'bg-green-500 hover:bg-green-600'
    case 'rosa': return 'bg-pink-500 hover:bg-pink-600'
    default: return 'bg-muted hover:bg-muted/80'
  }
}

export function ColorSelect({ 
  value, 
  onValueChange, 
  disabled = false, 
  isUpdating = false
}: ColorSelectProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Select 
            value={value || ''} 
            onValueChange={(newValue) => onValueChange(newValue === '' ? null : newValue as ColorMarcacao)} 
            disabled={disabled || isUpdating}
          >
            <SelectTrigger className="h-6 w-8 min-w-[32px] bg-background/50 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-200 p-1">
              <SelectValue>
                <div className="flex items-center justify-center">
                  {isUpdating ? (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  ) : value ? (
                    <div 
                      className={`w-4 h-4 rounded-full ${getColorStyle(value)} transition-all duration-200 hover:scale-110`}
                      title={CORES_MARCACAO.find(c => c.value === value)?.label}
                    />
                  ) : (
                    <Palette className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl w-36">
              <SelectItem value="" className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-dashed border-muted-foreground" />
                  <span className="text-xs">Sem cor</span>
                </div>
              </SelectItem>
              {CORES_MARCACAO.map((cor) => (
                <SelectItem key={cor.value} value={cor.value} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${cor.color} transition-all duration-200 hover:scale-110`} />
                    <span className="text-xs">{cor.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TooltipTrigger>
        <TooltipContent className="bg-card/95 backdrop-blur-sm border-border/50">
          <p>{value ? `Marcação: ${CORES_MARCACAO.find(c => c.value === value)?.label}` : 'Marcação por cor'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
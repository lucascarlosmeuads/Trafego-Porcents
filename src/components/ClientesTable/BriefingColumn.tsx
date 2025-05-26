
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertCircle } from 'lucide-react'
import { BriefingModal } from './BriefingModal'
import { useBriefingData } from '@/hooks/useBriefingData'

interface BriefingColumnProps {
  emailCliente: string
  nomeCliente: string
}

export function BriefingColumn({ emailCliente, nomeCliente }: BriefingColumnProps) {
  const { getBriefingByEmail, hasBriefing, loading } = useBriefingData()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const briefingExists = hasBriefing(emailCliente)
  const briefingData = getBriefingByEmail(emailCliente)

  console.log('🎨 [BriefingColumn] Renderizando para:', emailCliente, 'Existe:', briefingExists)

  if (briefingExists && briefingData) {
    return (
      <BriefingModal
        emailCliente={emailCliente}
        nomeCliente={nomeCliente}
        trigger={
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            Ver Briefing
          </Button>
        }
      />
    )
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <AlertCircle className="w-3 h-3 text-orange-500" />
      Não preenchido
    </Badge>
  )
}

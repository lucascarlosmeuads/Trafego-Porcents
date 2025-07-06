
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle } from 'lucide-react'

interface EmergencyMobileModalProps {
  onClose: () => void
  onContinue: () => void
}

export function EmergencyMobileModal({ onClose, onContinue }: EmergencyMobileModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="max-w-sm w-full bg-white border-0 shadow-2xl">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Acesso Temporário
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Você pode continuar usando o sistema temporariamente, mas recomendamos 
              aceitar os termos na próxima vez que acessar.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={onContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continuar Usando
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

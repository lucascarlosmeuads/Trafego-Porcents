
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Info, ArrowRight } from 'lucide-react'

export function AvisoMudancaStatus() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Verificar se o gestor já viu o aviso
    const avisoVisto = localStorage.getItem('aviso-gestor-status-visto')
    if (!avisoVisto) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('aviso-gestor-status-visto', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <Card className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-700/50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
            <Info className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">
              📝 Mudança de Nomenclatura
            </h3>
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
              O status <strong>"Campanha no Ar"</strong> agora se chama <strong>"Otimizações"</strong>. 
              Essa mudança já está ativa no sistema.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Entendi
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

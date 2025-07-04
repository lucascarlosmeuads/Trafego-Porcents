
import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Megaphone,
  ExternalLink
} from 'lucide-react'

export function ClienteSiteDescricao() {
  return (
    <div className="space-y-6">
      {/* Instruções Específicas - PRIORIDADE MÁXIMA */}
      <Alert className="border-green-200 bg-green-50">
        <Megaphone className="h-5 w-5 text-green-600" />
        <AlertDescription>
          <div className="space-y-3">
            <div className="text-green-800 font-semibold text-lg">
              📢 Seu site já está incluso no pacote! 💻✨
            </div>
            <div className="text-green-700 space-y-2">
              <p>
                Agora só falta preencher o formulário abaixo para começarmos a criação:
              </p>
              <div className="bg-white border border-green-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">
                      🔗 Formulário de Criação do Site
                    </p>
                    <p className="text-sm text-green-600">
                      Leva só 3 minutinhos e é super importante pra entendermos como seu site deve ser criado 🚀
                    </p>
                  </div>
                  <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                    <a 
                      href="https://siteexpress.space/formulario/trafego" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Preencher Formulário
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

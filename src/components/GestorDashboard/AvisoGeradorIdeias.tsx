import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Lightbulb } from 'lucide-react'

export function AvisoGeradorIdeias() {
  return (
    <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-600/30">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          🧪 NOVA FUNCIONALIDADE: Gerador de Ideias de Criativos (BETA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-gray-300 text-sm">
            Agora você pode gerar ideias criativas automaticamente a partir dos planejamentos estratégicos dos seus clientes.
          </p>
        </div>
        
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
          <p className="text-amber-300 text-xs font-medium mb-1">⚠️ IMPORTANTE - VERSÃO BETA:</p>
          <ul className="text-amber-200 text-xs space-y-1">
            <li>• Esta funcionalidade serve apenas para <strong>gerar ideias criativas</strong></li>
            <li>• <strong>Não envie essas ideias diretamente aos clientes</strong></li>
            <li>• Use como inspiração para criar materiais profissionais refinados</li>
            <li>• Acesse através dos "Materiais" de cada cliente</li>
          </ul>
        </div>

        <p className="text-gray-400 text-xs">
          📍 <strong>Como acessar:</strong> Vá em "Clientes" → Clique nos 3 pontos do cliente → "Materiais" → Aba "Criativos"
        </p>
      </CardContent>
    </Card>
  )
}
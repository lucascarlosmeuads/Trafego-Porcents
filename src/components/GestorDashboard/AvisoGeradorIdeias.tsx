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
            Agora você pode gerar <strong>imagens reais de criativos</strong> usando técnica de <strong>incongruência criativa</strong> baseado nos planejamentos estratégicos dos seus clientes.
          </p>
        </div>
        
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
          <p className="text-amber-300 text-xs font-medium mb-1">⚠️ IMPORTANTE - VERSÃO BETA:</p>
          <ul className="text-amber-200 text-xs space-y-1">
            <li>• Gera <strong>imagens reais de criativos</strong> usando incongruência criativa</li>
            <li>• Use essas <strong>imagens como base</strong> para criar os criativos finais dos clientes</li>
            <li>• Demonstre seu <strong>trabalho criativo profissional</strong> com essas ideias visuais</li>
            <li>• <strong>Criativos visuais reais</strong> para inspirar e refinar seu trabalho</li>
            <li>• Acesse através dos "Materiais" de cada cliente → Aba "Criativos"</li>
          </ul>
        </div>

        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <p className="text-red-300 text-xs font-medium mb-1">🎯 LEMBRETE IMPORTANTE:</p>
          <div className="text-red-200 text-xs space-y-1">
            <p><strong>Uma das maiores reclamações dos clientes é a falta de empenho no projeto</strong> como foi prometido para fechar.</p>
            <p>Os criativos trabalhados com <strong>incongruência criativa</strong> mostram que <strong>pensamos nos criativos</strong> e somos diferentes - isso é o que acreditamos que dá resultado.</p>
            <p><strong>Demonstrar esforço no criativo é o segredo</strong> para mostrar que o serviço foi feito. <strong>TESTAR CRIATIVO é o maior diferencial deste negócio.</strong></p>
            <p>🛠️ <em>Esta ferramenta foi criada para facilitar sua vida e mostrar nosso trabalho criativo profissional.</em></p>
          </div>
        </div>

        <p className="text-gray-400 text-xs">
          📍 <strong>Como acessar:</strong> Vá em "Clientes" → Clique nos 3 pontos do cliente → "Materiais" → Aba "Criativos"
        </p>
      </CardContent>
    </Card>
  )
}
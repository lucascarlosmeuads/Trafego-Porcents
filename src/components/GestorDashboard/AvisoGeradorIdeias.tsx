import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wand2, Mic, FileText, Sparkles } from 'lucide-react'

export function AvisoGeradorIdeias() {
  return (
    <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-600/30">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          🚀 NOVO: Gerador de Anúncios 2.0 no Menu Lateral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-gray-300 text-sm">
            O novo <strong>Gerador de Anúncios 2.0</strong> está funcionando muito melhor! Agora você pode criar anúncios completos de forma mais eficiente e profissional.
          </p>
        </div>
        
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <p className="text-green-300 text-xs font-medium mb-2">✨ NOVAS FUNCIONALIDADES:</p>
          <ul className="text-green-200 text-xs space-y-1">
            <li className="flex items-center gap-2">
              <Mic className="h-3 w-3" />
              <strong>Gravação de Áudio:</strong> Explique o projeto falando - a IA entende seu áudio
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              <strong>Upload de Documentos:</strong> Cole o planejamento do cliente em PDF
            </li>
            <li>• <strong>Análise Inteligente:</strong> IA analisa tudo e gera anúncios personalizados</li>
            <li>• <strong>Copies + Imagens:</strong> Gera textos e imagens profissionais automaticamente</li>
            <li>• <strong>Múltiplas Variações:</strong> Cria diferentes versões para testes A/B</li>
          </ul>
        </div>

        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <p className="text-blue-300 text-xs font-medium mb-1">🎯 COMO USAR:</p>
          <div className="text-blue-200 text-xs space-y-1">
            <p>1. <strong>Acesse o menu lateral</strong> → "Gerador de Criativos"</p>
            <p>2. <strong>Grave um áudio</strong> explicando o projeto OU <strong>faça upload do PDF</strong> do planejamento</p>
            <p>3. <strong>A IA analisa</strong> e extrai as informações principais</p>
            <p>4. <strong>Gera anúncios completos</strong> com copies e imagens profissionais</p>
            <p>5. <strong>Baixe e use</strong> nos projetos dos seus clientes</p>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3">
          <p className="text-purple-300 text-xs font-medium mb-1">💡 DICA PROFISSIONAL:</p>
          <p className="text-purple-200 text-xs">
            <strong>Demonstre valor real:</strong> Use esta ferramenta para criar anúncios únicos e personalizados que mostram seu trabalho criativo profissional. Seus clientes vão perceber a diferença na qualidade e dedicação!
          </p>
        </div>

        <p className="text-gray-400 text-xs text-center">
          📍 <strong>Acesse agora:</strong> Menu Lateral → "Gerador de Criativos" → Experimente as novas funcionalidades!
        </p>
      </CardContent>
    </Card>
  )
}
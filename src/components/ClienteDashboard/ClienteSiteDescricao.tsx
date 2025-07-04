import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { 
  Globe, 
  CheckCircle, 
  Info, 
  Lightbulb,
  Save,
  AlertCircle 
} from 'lucide-react'

export function ClienteSiteDescricao() {
  const { user } = useAuth()
  const { cliente, briefing } = useClienteData(user?.email || '')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (cliente?.site_descricao_personalizada) {
      setDescricao(cliente.site_descricao_personalizada)
    }
  }, [cliente])

  const handleSalvarDescricao = async () => {
    if (!user?.email) return
    
    setSalvando(true)
    setErro('')
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ 
          site_descricao_personalizada: descricao.trim() || null
        })
        .eq('email_cliente', user.email)

      if (error) throw error

      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
      
    } catch (error) {
      console.error('Erro ao salvar descrição do site:', error)
      setErro('Erro ao salvar descrição. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const temDescricao = descricao.trim().length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          Descreva Como Deseja o Site
          <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Opcional
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações sobre o site */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Como funciona o seu site:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• <strong>Site Padrão:</strong> Criamos baseado no seu produto/serviço do briefing</li>
                <li>• <strong>Site Personalizado:</strong> Descreva abaixo como você deseja</li>
                <li>• <strong>Prazo:</strong> Entregue em até 15 dias após ativação da campanha</li>
                <li>• <strong>Responsivo:</strong> Funciona perfeitamente em celular e desktop</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Exemplo do produto atual */}
        {briefing?.nome_produto && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-gray-800">Baseado no seu produto:</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>{briefing.nome_produto}</strong>
            </p>
            <p className="text-xs text-gray-600">
              {briefing.descricao_resumida || 'Sem descrição no briefing'}
            </p>
          </div>
        )}

        {/* Campo de descrição */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Descreva como você deseja o seu site (opcional):
          </label>
          <Textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Exemplo: Quero um site moderno com cores azul e branco, com seções para depoimentos de clientes, galeria de trabalhos realizados, formulário de contato e WhatsApp flutuante. Gostaria de um design limpo e profissional..."
            className="min-h-[120px]"
            maxLength={1000}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Se não preencher, criaremos um site padrão baseado no seu produto</span>
            <span>{descricao.length}/1000</span>
          </div>
        </div>

        {/* Exemplos de personalização */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 Ideias para personalizar:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Cores específicas da sua marca</p>
            <p>• Seções especiais (depoimentos, galeria, FAQ)</p>
            <p>• Estilo de design (moderno, clássico, minimalista)</p>
            <p>• Funcionalidades extras (chat, agendamento, catálogo)</p>
            <p>• Textos e chamadas específicas</p>
          </div>
        </div>

        {erro && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {erro}
            </AlertDescription>
          </Alert>
        )}

        {sucesso && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Descrição salva com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSalvarDescricao}
          disabled={salvando}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          size="lg"
        >
          {salvando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 w-4 mr-2" />
              {temDescricao ? 'Atualizar Descrição' : 'Pular Esta Etapa'}
            </>
          )}
        </Button>

        {temDescricao && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Descrição personalizada salva
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Vamos criar seu site seguindo suas especificações
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          💡 Lembre-se: quanto mais detalhado, melhor será o resultado final do seu site.
        </p>
      </CardContent>
    </Card>
  )
}

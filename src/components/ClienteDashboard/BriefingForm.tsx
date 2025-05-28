
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Edit, Save, CheckCircle } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import type { BriefingCliente } from '@/hooks/useClienteData'

interface BriefingFormProps {
  briefing: BriefingCliente | null
  emailCliente: string
  onBriefingUpdated: () => void
}

export function BriefingForm({ briefing, emailCliente, onBriefingUpdated }: BriefingFormProps) {
  const [isEditing, setIsEditing] = useState(!briefing)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const [formData, setFormData] = useState({
    nome_produto: briefing?.nome_produto || '',
    descricao_resumida: briefing?.descricao_resumida || '',
    publico_alvo: briefing?.publico_alvo || '',
    diferencial: briefing?.diferencial || '',
    investimento_diario: briefing?.investimento_diario?.toString() || '',
    observacoes_finais: briefing?.observacoes_finais || '',
    // Campos extras armazenados nas observações
    dados_comprador: '',
    situacao_site: '',
    links_redes: ''
  })

  const updateClienteStatus = async () => {
    try {
      console.log('🔄 [BriefingForm] Atualizando status do cliente para "Brief"...')
      
      const { error: updateError } = await supabase
        .from('todos_clientes')
        .update({ 
          status_campanha: 'Brief'
        })
        .eq('email_cliente', emailCliente)

      if (updateError) {
        console.error('❌ [BriefingForm] Erro ao atualizar status do cliente:', updateError)
        toast({
          title: "Aviso",
          description: "Briefing salvo, mas houve um problema ao atualizar o status. Entre em contato com o suporte.",
          variant: "default"
        })
      } else {
        console.log('✅ [BriefingForm] Status do cliente atualizado para "Brief" com sucesso')
      }
    } catch (error) {
      console.error('💥 [BriefingForm] Erro crítico ao atualizar status:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('🔄 [BriefingForm] Iniciando submissão do formulário...')
    console.log('📧 [BriefingForm] Email do cliente:', emailCliente)
    console.log('📝 [BriefingForm] Dados do formulário:', formData)

    try {
      // Validar campos obrigatórios
      if (!formData.nome_produto.trim()) {
        console.error('❌ [BriefingForm] Nome do produto é obrigatório')
        toast({
          title: "Campo obrigatório",
          description: "Nome do produto é obrigatório.",
          variant: "destructive"
        })
        return
      }

      if (!emailCliente) {
        console.error('❌ [BriefingForm] Email do cliente não fornecido')
        toast({
          title: "Erro de autenticação",
          description: "Email do cliente não encontrado. Faça login novamente.",
          variant: "destructive"
        })
        return
      }

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('❌ [BriefingForm] Erro de autenticação:', authError)
        toast({
          title: "Erro de autenticação",
          description: "Faça login para continuar.",
          variant: "destructive"
        })
        return
      }

      console.log('👤 [BriefingForm] Usuário autenticado:', user?.email)

      // Montar observações consolidadas
      let observacoesCompletas = formData.observacoes_finais || ''
      
      if (formData.dados_comprador) {
        observacoesCompletas += `\n\n📊 Dados do comprador ideal: ${formData.dados_comprador}`
      }
      
      if (formData.situacao_site) {
        observacoesCompletas += `\n\n🌐 Situação do site: ${formData.situacao_site}`
      }
      
      if (formData.links_redes) {
        observacoesCompletas += `\n\n🔗 Links e redes sociais: ${formData.links_redes}`
      }

      const briefingData = {
        email_cliente: emailCliente,
        nome_produto: formData.nome_produto.trim(),
        descricao_resumida: formData.descricao_resumida.trim() || null,
        publico_alvo: formData.publico_alvo.trim() || null,
        diferencial: formData.diferencial.trim() || null,
        investimento_diario: formData.investimento_diario ? Number(formData.investimento_diario) : null,
        observacoes_finais: observacoesCompletas.trim() || null,
        liberar_edicao: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('💾 [BriefingForm] Dados preparados para inserção:', briefingData)

      if (briefing) {
        // Atualizar briefing existente
        console.log('🔄 [BriefingForm] Atualizando briefing existente com ID:', briefing.id)
        
        const { data, error } = await supabase
          .from('briefings_cliente')
          .update({
            nome_produto: briefingData.nome_produto,
            descricao_resumida: briefingData.descricao_resumida,
            publico_alvo: briefingData.publico_alvo,
            diferencial: briefingData.diferencial,
            investimento_diario: briefingData.investimento_diario,
            observacoes_finais: briefingData.observacoes_finais,
            updated_at: briefingData.updated_at
          })
          .eq('id', briefing.id)
          .select()

        if (error) {
          console.error('❌ [BriefingForm] Erro ao atualizar briefing:', error)
          throw error
        }

        console.log('✅ [BriefingForm] Briefing atualizado com sucesso:', data)
        await updateClienteStatus()
      } else {
        // Criar novo briefing
        console.log('📝 [BriefingForm] Criando novo briefing...')
        
        const { data, error } = await supabase
          .from('briefings_cliente')
          .insert(briefingData)
          .select()

        if (error) {
          console.error('❌ [BriefingForm] Erro ao inserir briefing:', error)
          throw error
        }

        console.log('✅ [BriefingForm] Briefing criado com sucesso:', data)
        await updateClienteStatus()
      }

      toast({
        title: "Sucesso!",
        description: "Seu briefing foi salvo com sucesso e enviado para nossa equipe.",
      })

      console.log('🎉 [BriefingForm] Processo concluído com sucesso')
      setIsEditing(false)
      onBriefingUpdated()

    } catch (error: any) {
      console.error('💥 [BriefingForm] Erro crítico ao salvar briefing:', error)
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente."
      
      if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        errorMessage = "Você não tem permissão para salvar este briefing. Verifique se está logado."
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = "Já existe um briefing para este cliente."
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`
      }

      toast({
        title: "Erro ao salvar briefing",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const canEdit = !briefing || briefing.liberar_edicao

  return (
    <Card className={isMobile ? 'mx-0' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center justify-between ${
          isMobile ? 'text-lg flex-col items-start gap-2' : ''
        }`}>
          <span>Formulário de Briefing</span>
          {briefing && !isEditing && canEdit && (
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "sm"}
              onClick={() => setIsEditing(true)}
              className={isMobile ? 'w-full' : ''}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {briefing && !canEdit && (
            <div className={`flex items-center gap-2 text-green-600 ${
              isMobile ? 'w-full justify-center' : ''
            }`}>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Briefing aprovado</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-4' : ''}>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Produto */}
            <div>
              <Label htmlFor="nome_produto" className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                📝 Nome do Produto ou Serviço *
              </Label>
              <Input
                id="nome_produto"
                value={formData.nome_produto}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_produto: e.target.value }))}
                required
                className={isMobile ? 'mt-1 text-base' : ''}
                placeholder="Ex: Mentoria Transformacional, Loja de Moda Fitness, Curso de Inglês para Adultos"
              />
            </div>

            {/* Descrição do que vende */}
            <div>
              <Label htmlFor="descricao_resumida" className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                📣 Como você explicaria o que você vende (de forma breve)?
              </Label>
              <Textarea
                id="descricao_resumida"
                value={formData.descricao_resumida}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao_resumida: e.target.value }))}
                placeholder="Descreva como você apresenta seu produto para alguém pela primeira vez."
                className={isMobile ? 'mt-1 text-base min-h-[80px]' : ''}
              />
            </div>

            {/* Público-alvo */}
            <div>
              <Label htmlFor="publico_alvo" className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                🎯 Quem é o seu público-alvo?
              </Label>
              <Textarea
                id="publico_alvo"
                value={formData.publico_alvo}
                onChange={(e) => setFormData(prev => ({ ...prev, publico_alvo: e.target.value }))}
                placeholder="Ex: Mulheres de 25 a 40 anos, mães solo, empreendedores, homens que querem emagrecer..."
                className={isMobile ? 'mt-1 text-base min-h-[80px]' : ''}
              />
            </div>

            {/* Dados do comprador ideal */}
            <div>
              <Label htmlFor="dados_comprador" className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                📊 Dados do comprador ideal (faixa etária, gênero, localização):
              </Label>
              <Input
                id="dados_comprador"
                value={formData.dados_comprador}
                onChange={(e) => setFormData(prev => ({ ...prev, dados_comprador: e.target.value }))}
                placeholder="Ex: 25-40 anos, feminino, São Paulo"
                className={isMobile ? 'mt-1 text-base' : ''}
              />
            </div>

            {/* Diferencial */}
            <div>
              <Label htmlFor="diferencial" className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                🚀 Qual é o maior diferencial do seu produto ou serviço?
              </Label>
              <Textarea
                id="diferencial"
                value={formData.diferencial}
                onChange={(e) => setFormData(prev => ({ ...prev, diferencial: e.target.value }))}
                placeholder="O que torna seu produto único e especial?"
                className={isMobile ? 'mt-1 text-base min-h-[80px]' : ''}
              />
            </div>

            {/* Investimento */}
            <div>
              <Label htmlFor="investimento_diario" className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                💰 Quanto você pretende investir por dia em tráfego pago?
              </Label>
              <RadioGroup
                value={formData.investimento_diario}
                onValueChange={(value) => setFormData(prev => ({ ...prev, investimento_diario: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10" id="inv10" />
                  <Label htmlFor="inv10">R$ 10/dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="inv30" />
                  <Label htmlFor="inv30">R$ 30/dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50" id="inv50" />
                  <Label htmlFor="inv50">R$ 50/dia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100" id="inv100" />
                  <Label htmlFor="inv100">R$ 100+/dia</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Situação do site */}
            <div>
              <Label htmlFor="situacao_site" className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                🌐 Situação do seu site:
              </Label>
              <RadioGroup
                value={formData.situacao_site}
                onValueChange={(value) => setFormData(prev => ({ ...prev, situacao_site: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tem_site" id="tem_site" />
                  <Label htmlFor="tem_site">Sim, já tenho um site</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quero_site" id="quero_site" />
                  <Label htmlFor="quero_site">Não tenho, mas quero que vocês façam um</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_preciso" id="nao_preciso" />
                  <Label htmlFor="nao_preciso">Não tenho e não preciso de um</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Links e redes sociais */}
            {formData.situacao_site === 'tem_site' && (
              <div>
                <Label htmlFor="links_redes" className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                  🔗 Cole os links do seu site e redes sociais aqui:
                </Label>
                <Textarea
                  id="links_redes"
                  value={formData.links_redes}
                  onChange={(e) => setFormData(prev => ({ ...prev, links_redes: e.target.value }))}
                  placeholder="Instagram, site, YouTube, página de vendas..."
                  className={isMobile ? 'mt-1 text-base min-h-[80px]' : ''}
                />
              </div>
            )}

            {/* Observações finais */}
            <div>
              <Label htmlFor="observacoes_finais" className={isMobile ? 'text-sm font-medium' : ''}>
                Observações Finais
              </Label>
              <Textarea
                id="observacoes_finais"
                value={formData.observacoes_finais}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes_finais: e.target.value }))}
                placeholder="Informações adicionais importantes..."
                className={isMobile ? 'mt-1 text-base min-h-[80px]' : ''}
              />
            </div>

            <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
              <Button 
                type="submit" 
                disabled={loading}
                className={isMobile ? 'w-full py-3 text-base' : ''}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Briefing'}
              </Button>
              {briefing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className={isMobile ? 'w-full py-3 text-base' : ''}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        ) : briefing ? (
          <div className="space-y-4">
            <div>
              <Label className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                📝 Nome do Produto/Serviço
              </Label>
              <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>
                {briefing.nome_produto}
              </p>
            </div>

            {briefing.descricao_resumida && (
              <div>
                <Label className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                  📣 Como você explica o que vende
                </Label>
                <p className={isMobile ? 'text-base' : 'text-sm'}>{briefing.descricao_resumida}</p>
              </div>
            )}

            {briefing.publico_alvo && (
              <div>
                <Label className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                  🎯 Público-alvo
                </Label>
                <p className={isMobile ? 'text-base' : 'text-sm'}>{briefing.publico_alvo}</p>
              </div>
            )}

            {briefing.diferencial && (
              <div>
                <Label className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                  🚀 Diferencial do Produto
                </Label>
                <p className={isMobile ? 'text-base' : 'text-sm'}>{briefing.diferencial}</p>
              </div>
            )}

            {briefing.investimento_diario && (
              <div>
                <Label className={`${isMobile ? 'text-sm font-medium' : ''} flex items-center gap-2`}>
                  💰 Investimento Diário
                </Label>
                <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>
                  R$ {briefing.investimento_diario}/dia
                </p>
              </div>
            )}

            {briefing.observacoes_finais && (
              <div>
                <Label className={isMobile ? 'text-sm font-medium' : ''}>Observações Finais</Label>
                <p className={isMobile ? 'text-base' : 'text-sm'} style={{ whiteSpace: 'pre-wrap' }}>{briefing.observacoes_finais}</p>
              </div>
            )}
          </div>
        ) : (
          <p className={`text-muted-foreground ${isMobile ? 'text-base text-center' : ''}`}>
            Clique no botão acima para preencher seu briefing e começar sua campanha.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

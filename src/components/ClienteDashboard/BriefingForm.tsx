
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
    investimento_diario: briefing?.investimento_diario || '',
    observacoes_finais: briefing?.observacoes_finais || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const briefingData = {
        email_cliente: emailCliente,
        nome_produto: formData.nome_produto,
        descricao_resumida: formData.descricao_resumida,
        publico_alvo: formData.publico_alvo,
        diferencial: formData.diferencial,
        investimento_diario: formData.investimento_diario ? Number(formData.investimento_diario) : null,
        observacoes_finais: formData.observacoes_finais
      }

      if (briefing) {
        // Atualizar briefing existente
        const { error } = await supabase
          .from('briefings_cliente')
          .update(briefingData)
          .eq('id', briefing.id)

        if (error) throw error
      } else {
        // Criar novo briefing
        const { error } = await supabase
          .from('briefings_cliente')
          .insert(briefingData)

        if (error) throw error
      }

      toast({
        title: "Briefing salvo com sucesso!",
        description: "Seus dados foram salvos e enviados para a equipe.",
      })

      setIsEditing(false)
      onBriefingUpdated()

    } catch (error) {
      console.error('Erro ao salvar briefing:', error)
      toast({
        title: "Erro ao salvar briefing",
        description: "Tente novamente em alguns instantes.",
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome_produto" className={isMobile ? 'text-sm font-medium' : ''}>
                Nome do Produto *
              </Label>
              <Input
                id="nome_produto"
                value={formData.nome_produto}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_produto: e.target.value }))}
                required
                className={isMobile ? 'mt-1 text-base' : ''}
              />
            </div>

            <div>
              <Label htmlFor="descricao_resumida" className={isMobile ? 'text-sm font-medium' : ''}>
                Descrição Resumida
              </Label>
              <Textarea
                id="descricao_resumida"
                value={formData.descricao_resumida}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao_resumida: e.target.value }))}
                placeholder="Descreva brevemente seu produto..."
                className={isMobile ? 'mt-1 text-base min-h-[80px]' : ''}
              />
            </div>

            <div>
              <Label htmlFor="publico_alvo" className={isMobile ? 'text-sm font-medium' : ''}>
                Público-alvo
              </Label>
              <Textarea
                id="publico_alvo"
                value={formData.publico_alvo}
                onChange={(e) => setFormData(prev => ({ ...prev, publico_alvo: e.target.value }))}
                placeholder="Quem é seu cliente ideal?"
                className={isMobile ? 'mt-1 text-base min-h-[80px]' : ''}
              />
            </div>

            <div>
              <Label htmlFor="diferencial" className={isMobile ? 'text-sm font-medium' : ''}>
                Diferencial do Produto
              </Label>
              <Textarea
                id="diferencial"
                value={formData.diferencial}
                onChange={(e) => setFormData(prev => ({ ...prev, diferencial: e.target.value }))}
                placeholder="O que torna seu produto único?"
                className={isMobile ? 'mt-1 text-base min-h-[80px]' : ''}
              />
            </div>

            <div>
              <Label htmlFor="investimento_diario" className={isMobile ? 'text-sm font-medium' : ''}>
                Investimento Diário (R$)
              </Label>
              <Input
                id="investimento_diario"
                type="number"
                step="0.01"
                value={formData.investimento_diario}
                onChange={(e) => setFormData(prev => ({ ...prev, investimento_diario: e.target.value }))}
                placeholder="100.00"
                className={isMobile ? 'mt-1 text-base' : ''}
              />
            </div>

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
              <Label className={isMobile ? 'text-sm font-medium' : ''}>Nome do Produto</Label>
              <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>
                {briefing.nome_produto}
              </p>
            </div>

            {briefing.descricao_resumida && (
              <div>
                <Label className={isMobile ? 'text-sm font-medium' : ''}>Descrição Resumida</Label>
                <p className={isMobile ? 'text-base' : 'text-sm'}>{briefing.descricao_resumida}</p>
              </div>
            )}

            {briefing.publico_alvo && (
              <div>
                <Label className={isMobile ? 'text-sm font-medium' : ''}>Público-alvo</Label>
                <p className={isMobile ? 'text-base' : 'text-sm'}>{briefing.publico_alvo}</p>
              </div>
            )}

            {briefing.diferencial && (
              <div>
                <Label className={isMobile ? 'text-sm font-medium' : ''}>Diferencial do Produto</Label>
                <p className={isMobile ? 'text-base' : 'text-sm'}>{briefing.diferencial}</p>
              </div>
            )}

            {briefing.investimento_diario && (
              <div>
                <Label className={isMobile ? 'text-sm font-medium' : ''}>Investimento Diário</Label>
                <p className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>
                  R$ {briefing.investimento_diario}
                </p>
              </div>
            )}

            {briefing.observacoes_finais && (
              <div>
                <Label className={isMobile ? 'text-sm font-medium' : ''}>Observações Finais</Label>
                <p className={isMobile ? 'text-base' : 'text-sm'}>{briefing.observacoes_finais}</p>
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

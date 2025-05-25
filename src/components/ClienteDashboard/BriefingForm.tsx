
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Edit, Save, CheckCircle } from 'lucide-react'
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

  const [formData, setFormData] = useState({
    nome_produto: briefing?.nome_produto || '',
    descricao_resumida: briefing?.descricao_resumida || '',
    publico_alvo: briefing?.publico_alvo || '',
    diferencial: briefing?.diferencial || '',
    investimento_diario: briefing?.investimento_diario || '',
    comissao_aceita: briefing?.comissao_aceita || '',
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
        comissao_aceita: formData.comissao_aceita,
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Formulário de Briefing
          {briefing && !isEditing && canEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {briefing && !canEdit && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Briefing aprovado</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome_produto">Nome do Produto *</Label>
              <Input
                id="nome_produto"
                value={formData.nome_produto}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_produto: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao_resumida">Descrição Resumida</Label>
              <Textarea
                id="descricao_resumida"
                value={formData.descricao_resumida}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao_resumida: e.target.value }))}
                placeholder="Descreva brevemente seu produto..."
              />
            </div>

            <div>
              <Label htmlFor="publico_alvo">Público-alvo</Label>
              <Textarea
                id="publico_alvo"
                value={formData.publico_alvo}
                onChange={(e) => setFormData(prev => ({ ...prev, publico_alvo: e.target.value }))}
                placeholder="Quem é seu cliente ideal?"
              />
            </div>

            <div>
              <Label htmlFor="diferencial">Diferencial do Produto</Label>
              <Textarea
                id="diferencial"
                value={formData.diferencial}
                onChange={(e) => setFormData(prev => ({ ...prev, diferencial: e.target.value }))}
                placeholder="O que torna seu produto único?"
              />
            </div>

            <div>
              <Label htmlFor="investimento_diario">Investimento Diário (R$)</Label>
              <Input
                id="investimento_diario"
                type="number"
                step="0.01"
                value={formData.investimento_diario}
                onChange={(e) => setFormData(prev => ({ ...prev, investimento_diario: e.target.value }))}
                placeholder="100.00"
              />
            </div>

            <div>
              <Label htmlFor="comissao_aceita">Comissão Aceita</Label>
              <Input
                id="comissao_aceita"
                value={formData.comissao_aceita}
                onChange={(e) => setFormData(prev => ({ ...prev, comissao_aceita: e.target.value }))}
                placeholder="Ex: 20% ou R$ 50,00"
              />
            </div>

            <div>
              <Label htmlFor="observacoes_finais">Observações Finais</Label>
              <Textarea
                id="observacoes_finais"
                value={formData.observacoes_finais}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes_finais: e.target.value }))}
                placeholder="Informações adicionais importantes..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Briefing'}
              </Button>
              {briefing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        ) : briefing ? (
          <div className="space-y-4">
            <div>
              <Label>Nome do Produto</Label>
              <p className="text-sm font-medium">{briefing.nome_produto}</p>
            </div>

            {briefing.descricao_resumida && (
              <div>
                <Label>Descrição Resumida</Label>
                <p className="text-sm">{briefing.descricao_resumida}</p>
              </div>
            )}

            {briefing.publico_alvo && (
              <div>
                <Label>Público-alvo</Label>
                <p className="text-sm">{briefing.publico_alvo}</p>
              </div>
            )}

            {briefing.diferencial && (
              <div>
                <Label>Diferencial do Produto</Label>
                <p className="text-sm">{briefing.diferencial}</p>
              </div>
            )}

            {briefing.investimento_diario && (
              <div>
                <Label>Investimento Diário</Label>
                <p className="text-sm font-medium">R$ {briefing.investimento_diario}</p>
              </div>
            )}

            {briefing.comissao_aceita && (
              <div>
                <Label>Comissão Aceita</Label>
                <p className="text-sm font-medium">{briefing.comissao_aceita}</p>
              </div>
            )}

            {briefing.observacoes_finais && (
              <div>
                <Label>Observações Finais</Label>
                <p className="text-sm">{briefing.observacoes_finais}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Clique no botão acima para preencher seu briefing e começar sua campanha.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

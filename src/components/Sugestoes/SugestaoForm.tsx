
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Lightbulb, Send } from 'lucide-react'
import type { SugestaoMelhoria } from '@/hooks/useSugestoesMelhorias'

interface SugestaoFormProps {
  onClose: () => void
  onSubmit: (sugestao: Omit<SugestaoMelhoria, 'id' | 'created_at' | 'updated_at' | 'status' | 'resposta_admin' | 'respondido_em'>) => Promise<boolean>
  gestorEmail: string
  gestorNome: string
  sugestaoInicial?: Partial<SugestaoMelhoria>
}

export function SugestaoForm({ onClose, onSubmit, gestorEmail, gestorNome, sugestaoInicial }: SugestaoFormProps) {
  const [titulo, setTitulo] = useState(sugestaoInicial?.titulo || '')
  const [descricao, setDescricao] = useState(sugestaoInicial?.descricao || '')
  const [categoria, setCategoria] = useState<SugestaoMelhoria['categoria']>(sugestaoInicial?.categoria || 'funcionalidade')
  const [prioridade, setPrioridade] = useState<SugestaoMelhoria['prioridade']>(sugestaoInicial?.prioridade || 'media')
  const [loading, setLoading] = useState(false)

  const categorias = [
    { value: 'interface', label: 'Interface/Design', description: 'Melhorias visuais e de usabilidade' },
    { value: 'funcionalidade', label: 'Nova Funcionalidade', description: 'Novas features ou recursos' },
    { value: 'performance', label: 'Performance', description: 'Otimizações de velocidade' },
    { value: 'bug', label: 'Correção de Bug', description: 'Problemas identificados' },
    { value: 'outros', label: 'Outros', description: 'Outras sugestões' }
  ]

  const prioridades = [
    { value: 'baixa', label: 'Baixa', color: 'text-green-600', description: 'Melhoria desejável' },
    { value: 'media', label: 'Média', color: 'text-yellow-600', description: 'Melhoria importante' },
    { value: 'alta', label: 'Alta', color: 'text-red-600', description: 'Melhoria urgente' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!titulo.trim() || !descricao.trim()) {
      return
    }

    setLoading(true)

    const novaSugestao = {
      gestor_email: gestorEmail,
      gestor_nome: gestorNome,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      prioridade
    }

    const sucesso = await onSubmit(novaSugestao)
    
    if (sucesso) {
      onClose()
    }
    
    setLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            {sugestaoInicial ? 'Editar Sugestão' : 'Nova Sugestão de Melhoria'}
          </DialogTitle>
          <DialogDescription>
            Compartilhe sua ideia para melhorar o sistema. Seja específico e detalhado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Sugestão *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Melhorar filtros na tabela de clientes"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={categoria} onValueChange={(value: SugestaoMelhoria['categoria']) => setCategoria(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div>
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-xs text-gray-500">{cat.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade *</Label>
              <Select value={prioridade} onValueChange={(value: SugestaoMelhoria['prioridade']) => setPrioridade(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {prioridades.map((prio) => (
                    <SelectItem key={prio.value} value={prio.value}>
                      <div>
                        <div className={`font-medium ${prio.color}`}>{prio.label}</div>
                        <div className="text-xs text-gray-500">{prio.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição Detalhada *</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva sua sugestão em detalhes. Inclua o problema atual, a solução proposta e os benefícios esperados..."
              rows={6}
              required
              disabled={loading}
            />
            <div className="text-xs text-gray-500">
              Seja específico: explique o problema, sua solução e como isso melhoraria o sistema.
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !titulo.trim() || !descricao.trim()}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {sugestaoInicial ? 'Atualizar' : 'Enviar Sugestão'}
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

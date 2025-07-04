
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2 } from 'lucide-react'
import { useClientesAntigos } from '@/hooks/useClientesAntigos'
import { useGestores } from '@/hooks/useGestores'

interface AddClienteAntigoModalProps {
  onSuccess?: () => void
}

export function AddClienteAntigoModal({ onSuccess }: AddClienteAntigoModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addClienteAntigo } = useClientesAntigos()
  const { gestores } = useGestores()

  const [formData, setFormData] = useState({
    nome_cliente: '',
    email_cliente: '',
    telefone: '',
    vendedor: '',
    email_gestor: '',
    data_venda: '',
    valor_comissao: 60,
    comissao: 'Pendente',
    site_status: 'pendente',
    site_pago: false,
    descricao_problema: '',
    link_briefing: '',
    link_criativo: '',
    link_site: '',
    numero_bm: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome_cliente || !formData.email_cliente || !formData.telefone || 
        !formData.vendedor || !formData.email_gestor || !formData.data_venda) {
      return
    }

    setLoading(true)
    
    const success = await addClienteAntigo({
      ...formData,
      valor_comissao: Number(formData.valor_comissao)
    })

    if (success) {
      setOpen(false)
      setFormData({
        nome_cliente: '',
        email_cliente: '',
        telefone: '',
        vendedor: '',
        email_gestor: '',
        data_venda: '',
        valor_comissao: 60,
        comissao: 'Pendente',
        site_status: 'pendente',
        site_pago: false,
        descricao_problema: '',
        link_briefing: '',
        link_criativo: '',
        link_site: '',
        numero_bm: ''
      })
      onSuccess?.()
    }
    
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Cliente Antigo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Cliente Antigo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_cliente">Email do Cliente *</Label>
              <Input
                id="email_cliente"
                type="email"
                value={formData.email_cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, email_cliente: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendedor">Vendedor *</Label>
              <Input
                id="vendedor"
                value={formData.vendedor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendedor: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_gestor">Gestor Responsável *</Label>
              <Select
                value={formData.email_gestor}
                onValueChange={(value) => setFormData(prev => ({ ...prev, email_gestor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gestor" />
                </SelectTrigger>
                <SelectContent>
                  {gestores.map((gestor) => (
                    <SelectItem key={gestor.email} value={gestor.email}>
                      {gestor.nome} ({gestor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_venda">Data da Venda *</Label>
              <Input
                id="data_venda"
                type="date"
                value={formData.data_venda}
                onChange={(e) => setFormData(prev => ({ ...prev, data_venda: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_comissao">Valor da Comissão (R$)</Label>
              <Input
                id="valor_comissao"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_comissao}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_comissao: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comissao">Status da Comissão</Label>
              <Select
                value={formData.comissao}
                onValueChange={(value) => setFormData(prev => ({ ...prev, comissao: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_status">Status do Site</Label>
              <Select
                value={formData.site_status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, site_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="site_pago"
                checked={formData.site_pago}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, site_pago: checked }))}
              />
              <Label htmlFor="site_pago">Site Pago</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero_bm">Número do BM</Label>
              <Input
                id="numero_bm"
                value={formData.numero_bm}
                onChange={(e) => setFormData(prev => ({ ...prev, numero_bm: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_briefing">Link do Briefing</Label>
              <Input
                id="link_briefing"
                type="url"
                value={formData.link_briefing}
                onChange={(e) => setFormData(prev => ({ ...prev, link_briefing: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_criativo">Link do Criativo</Label>
              <Input
                id="link_criativo"
                type="url"
                value={formData.link_criativo}
                onChange={(e) => setFormData(prev => ({ ...prev, link_criativo: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_site">Link do Site</Label>
              <Input
                id="link_site"
                type="url"
                value={formData.link_site}
                onChange={(e) => setFormData(prev => ({ ...prev, link_site: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao_problema">Descrição do Problema</Label>
              <Textarea
                id="descricao_problema"
                value={formData.descricao_problema}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao_problema: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

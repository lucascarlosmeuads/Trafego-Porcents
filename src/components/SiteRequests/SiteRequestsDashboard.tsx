import { useState } from 'react'
import { useSiteSolicitations } from '@/hooks/useSiteSolicitations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Globe, Phone, Mail, Calendar, Clock, CheckCircle, AlertCircle, ExternalLink, MessageSquare, Users, UserCheck } from 'lucide-react'
import type { SiteSolicitation } from '@/hooks/useSiteSolicitations'

export function SiteRequestsDashboard() {
  const { solicitations, loading, updateSolicitationStatus } = useSiteSolicitations()
  const [selectedSolicitation, setSelectedSolicitation] = useState<SiteSolicitation | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [observacoes, setObservacoes] = useState('')
  const [updating, setUpdating] = useState(false)

  const handleUpdateStatus = async () => {
    if (!selectedSolicitation || !newStatus) return

    setUpdating(true)
    const success = await updateSolicitationStatus(
      selectedSolicitation.id, 
      newStatus as SiteSolicitation['status'],
      observacoes
    )

    if (success) {
      setSelectedSolicitation(null)
      setNewStatus('')
      setObservacoes('')
    }

    setUpdating(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="badge-contrast badge-pendente"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'em_andamento':
        return <Badge className="badge-contrast badge-em-andamento"><AlertCircle className="h-3 w-3 mr-1" />Em andamento</Badge>
      case 'concluido':
        return <Badge className="badge-contrast badge-concluido"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getOrigemBadge = (origem: string) => {
    if (origem === 'manual') {
      return <Badge className="badge-contrast badge-manual"><Users className="h-3 w-3 mr-1" />Solicitação Manual</Badge>
    } else {
      return <Badge className="badge-contrast badge-gestor"><UserCheck className="h-3 w-3 mr-1" />Marcado por Gestor</Badge>
    }
  }

  const getStatusCount = (status: string) => {
    return solicitations.filter(s => s.status === status).length
  }

  const getOrigemCount = (origem: string) => {
    return solicitations.filter(s => s.origem === origem).length
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-contrast">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="header-title flex items-center gap-2">
            <Globe className="h-6 w-6 text-contrast" />
            Solicitações de Site
          </h1>
          <p className="text-contrast-secondary mt-1">
            Gerencie as solicitações de criação de site dos clientes
          </p>
        </div>
        <Button
          variant="outline"
          className="btn-contrast"
          onClick={() => window.open('https://siteexpress.space/formulario', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Formulário
        </Button>
      </div>

      {/* Cards de resumo por status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="status-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="status-description">Pendentes</p>
                <p className="status-number text-yellow-600">{getStatusCount('pendente')}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="status-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="status-description">Em Andamento</p>
                <p className="status-number text-blue-600">{getStatusCount('em_andamento')}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="status-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="status-description">Concluídos</p>
                <p className="status-number text-green-600">{getStatusCount('concluido')}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de resumo por origem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="status-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="status-description">Solicitações Manuais</p>
                <p className="status-number text-blue-600">{getOrigemCount('manual')}</p>
                <p className="text-xs text-contrast-secondary">Enviadas pelos clientes</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="status-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="status-description">Marcados por Gestores</p>
                <p className="status-number text-purple-600">{getOrigemCount('gestor')}</p>
                <p className="text-xs text-contrast-secondary">Status "aguardando link"</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de solicitações */}
      <div className="space-y-4">
        {solicitations.length === 0 ? (
          <Card className="status-card">
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-contrast text-lg">Nenhuma solicitação de site encontrada</p>
              <p className="text-contrast-secondary text-sm mt-2">
                As solicitações aparecerão aqui quando os clientes manifestarem interesse ou quando gestores marcarem clientes como "aguardando link"
              </p>
            </CardContent>
          </Card>
        ) : (
          solicitations.map((solicitation) => (
            <Card key={solicitation.id} className="status-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-contrast">
                        {solicitation.nome_cliente}
                      </h3>
                      {getStatusBadge(solicitation.status)}
                      {getOrigemBadge(solicitation.origem)}
                      {solicitation.vendedor && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 font-medium">
                          Vendedor: {solicitation.vendedor}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-contrast-secondary">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">{solicitation.email_cliente}</span>
                      </div>
                      
                      {solicitation.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">{solicitation.telefone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          {solicitation.origem === 'manual' ? 'Solicitado' : 'Marcado'} em {new Date(solicitation.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {solicitation.data_venda && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Venda: {new Date(solicitation.data_venda).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    {solicitation.observacoes && (
                      <div className="bg-contrast-secondary rounded-lg p-3 border">
                        <p className="text-xs text-contrast-secondary mb-1 font-medium">Observações:</p>
                        <p className="text-sm text-contrast">{solicitation.observacoes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {solicitation.origem === 'manual' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://siteexpress.space/formulario', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSolicitation(solicitation)
                            setNewStatus(solicitation.status)
                            setObservacoes(solicitation.observacoes || '')
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-contrast">
                        <DialogHeader>
                          <DialogTitle className="text-contrast">
                            Atualizar Solicitação - {solicitation.nome_cliente}
                            <div className="text-sm font-normal text-contrast-secondary mt-1">
                              {solicitation.origem === 'manual' ? 'Solicitação Manual' : 'Marcado por Gestor'}
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-contrast">Status:</label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger className="bg-contrast text-contrast">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-contrast">
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                <SelectItem value="concluido">Concluído</SelectItem>
                              </SelectContent>
                            </Select>
                            {solicitation.origem === 'gestor' && (
                              <p className="text-xs text-contrast-secondary mt-1">
                                ℹ️ Concluído = Site finalizado (atualiza status do cliente)
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-contrast">Observações:</label>
                            <Textarea
                              value={observacoes}
                              onChange={(e) => setObservacoes(e.target.value)}
                              placeholder="Adicione observações sobre o contato ou andamento..."
                              rows={3}
                              className="bg-contrast text-contrast"
                            />
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedSolicitation(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleUpdateStatus}
                              disabled={updating}
                              className="btn-contrast"
                            >
                              {updating ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

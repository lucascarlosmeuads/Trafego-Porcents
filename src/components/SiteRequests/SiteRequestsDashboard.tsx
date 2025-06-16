
import { useState } from 'react'
import { useSiteSolicitations } from '@/hooks/useSiteSolicitations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Globe, Phone, Mail, Calendar, Clock, CheckCircle, AlertCircle, ExternalLink, MessageSquare } from 'lucide-react'
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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'em_andamento':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><AlertCircle className="h-3 w-3 mr-1" />Em andamento</Badge>
      case 'concluido':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusCount = (status: string) => {
    return solicitations.filter(s => s.status === status).length
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Solicitações de Site
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie as solicitações de criação de site dos clientes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open('https://siteexpress.space/formulario', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Formulário
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pendente')}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{getStatusCount('em_andamento')}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('concluido')}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de solicitações */}
      <div className="space-y-4">
        {solicitations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma solicitação de site encontrada</p>
              <p className="text-gray-400 text-sm mt-2">
                As solicitações aparecerão aqui quando os clientes manifestarem interesse
              </p>
            </CardContent>
          </Card>
        ) : (
          solicitations.map((solicitation) => (
            <Card key={solicitation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {solicitation.nome_cliente}
                      </h3>
                      {getStatusBadge(solicitation.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{solicitation.email_cliente}</span>
                      </div>
                      
                      {solicitation.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{solicitation.telefone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Solicitado em {new Date(solicitation.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {solicitation.observacoes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Observações:</p>
                        <p className="text-sm">{solicitation.observacoes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://siteexpress.space/formulario', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
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
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Atualizar Solicitação - {solicitation.nome_cliente}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Status:</label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                <SelectItem value="concluido">Concluído</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Observações:</label>
                            <Textarea
                              value={observacoes}
                              onChange={(e) => setObservacoes(e.target.value)}
                              placeholder="Adicione observações sobre o contato ou andamento..."
                              rows={3}
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

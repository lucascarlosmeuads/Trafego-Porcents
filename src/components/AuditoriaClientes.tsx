
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, User, Mail, Clock, Search, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ClienteAuditoria {
  id: number
  nome_cliente: string
  email_cliente: string
  email_gestor: string
  vendedor: string
  data_venda: string
  created_at: string
  status_campanha: string
}

export function AuditoriaClientes() {
  const [clientes, setClientes] = useState<ClienteAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroGestor, setFiltroGestor] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroData, setFiltroData] = useState('')

  useEffect(() => {
    fetchClientesAuditoria()
  }, [])

  const fetchClientesAuditoria = async () => {
    try {
      setLoading(true)
      
      // Buscar todos os clientes criados ordenados por data de criação (mais recentes primeiro)
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente, email_gestor, vendedor, data_venda, created_at, status_campanha')
        .not('email_gestor', 'is', null)
        .neq('email_gestor', '')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar auditoria de clientes:', error)
        return
      }

      console.log('📊 [AuditoriaClientes] Total de clientes encontrados:', data?.length || 0)
      setClientes(data || [])
      
    } catch (error) {
      console.error('Erro na auditoria:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obter nome do gestor baseado no email
  const getGestorNome = (email: string) => {
    const gestorMap: Record<string, string> = {
      'andreza@trafegoporcents.com': 'Andreza',
      'carol@trafegoporcents.com': 'Carol', 
      'junior@trafegoporcents.com': 'Junior',
      'danielmoreira@trafegoporcents.com': 'Daniel Moreira',
      'danielribeiro@trafegoporcents.com': 'Daniel Ribeiro',
      'kimberlly@trafegoporcents.com': 'Kimberlly',
      'jose@trafegoporcents.com': 'Jose',
      'emily@trafegoporcents.com': 'Emily',
      'falcao@trafegoporcents.com': 'Falcao',
      'felipealmeida@trafegoporcents.com': 'Felipe Almeida',
      'franciellen@trafegoporcents.com': 'Franciellen',
      'guilherme@trafegoporcents.com': 'Guilherme',
      'leandrodrumzique@trafegoporcents.com': 'Leandro Drumzique',
      'matheuspaviani@trafegoporcents.com': 'Matheus Paviani',
      'rullian@trafegoporcents.com': 'Rullian'
    }
    return gestorMap[email] || email
  }

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const nomeGestor = getGestorNome(cliente.email_gestor)
    const matchGestor = filtroGestor === '' || 
      nomeGestor.toLowerCase().includes(filtroGestor.toLowerCase()) ||
      cliente.email_gestor.toLowerCase().includes(filtroGestor.toLowerCase())
    
    const matchCliente = filtroCliente === '' || 
      cliente.nome_cliente.toLowerCase().includes(filtroCliente.toLowerCase()) ||
      cliente.email_cliente.toLowerCase().includes(filtroCliente.toLowerCase())
    
    const matchData = filtroData === '' || 
      (cliente.created_at && cliente.created_at.startsWith(filtroData))
    
    return matchGestor && matchCliente && matchData
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preenchimento do Formulário':
        return 'bg-yellow-100 text-yellow-800'
      case 'Brief':
        return 'bg-blue-100 text-blue-800'
      case 'Criativo':
        return 'bg-purple-100 text-purple-800'
      case 'Site':
        return 'bg-orange-100 text-orange-800'
      case 'No Ar':
        return 'bg-green-100 text-green-800'
      case 'Saque Pendente':
        return 'bg-emerald-100 text-emerald-800'
      case 'Problema':
        return 'bg-red-100 text-red-800'
      case 'Off':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Carregando auditoria...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🔍 Auditoria de Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Monitore todas as criações de clientes por gestores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50">
            {clientesFiltrados.length} de {clientes.length} clientes
          </Badge>
          <Button onClick={fetchClientesAuditoria} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtro-gestor">Gestor</Label>
              <Input
                id="filtro-gestor"
                placeholder="Nome ou email do gestor"
                value={filtroGestor}
                onChange={(e) => setFiltroGestor(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filtro-cliente">Cliente</Label>
              <Input
                id="filtro-cliente"
                placeholder="Nome ou email do cliente"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filtro-data">Data de Criação</Label>
              <Input
                id="filtro-data"
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {clientesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {clientes.length === 0 
                  ? "Nenhum cliente encontrado na auditoria" 
                  : "Nenhum cliente corresponde aos filtros aplicados"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Info do Cliente */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{cliente.nome_cliente}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{cliente.email_cliente}</span>
                    </div>
                  </div>

                  {/* Info do Gestor */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Criado por:</div>
                    <div className="font-medium text-green-700">
                      {getGestorNome(cliente.email_gestor)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {cliente.email_gestor}
                    </div>
                  </div>

                  {/* Data e Status */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">
                        {cliente.created_at ? format(new Date(cliente.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
                      </span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(cliente.status_campanha)}`}>
                      {cliente.status_campanha}
                    </Badge>
                  </div>

                  {/* Info Adicional */}
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">ID: #{cliente.id}</div>
                    <div className="text-xs text-muted-foreground">
                      Vendedor: {cliente.vendedor || 'N/A'}
                    </div>
                    {cliente.data_venda && (
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Venda: {format(new Date(cliente.data_venda), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    )}
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

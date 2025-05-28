
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_CAMPANHA } from '@/lib/supabase'

interface ClienteComProblema {
  id: string
  nome_cliente: string
  email_gestor: string
  status_campanha: string
  descricao_problema: string
}

interface ProblemasPanelProps {
  gestorMode?: boolean
}

export function ProblemasPanel({ gestorMode = false }: ProblemasPanelProps) {
  const { user, isAdmin } = useAuth()
  const [clientesComProblema, setClientesComProblema] = useState<ClienteComProblema[]>([])
  const [loading, setLoading] = useState(true)
  const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null)

  const buscarClientesComProblema = async () => {
    try {
      console.log('🔍 [ProblemasPanel] Buscando clientes com status Problema...')
      
      let query = supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_gestor, status_campanha, descricao_problema')
        .eq('status_campanha', 'Problema')
        .order('id', { ascending: true })

      // Se for gestor mode (não admin), filtrar por email do usuário
      if (gestorMode && !isAdmin && user?.email) {
        query = query.eq('email_gestor', user.email)
        console.log('🔒 [ProblemasPanel] Filtro de gestor aplicado:', user.email)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [ProblemasPanel] Erro ao buscar clientes com problema:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar clientes com problemas",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [ProblemasPanel] Clientes com problema encontrados:', data?.length || 0)
      setClientesComProblema(data || [])
    } catch (err) {
      console.error('💥 [ProblemasPanel] Erro na busca:', err)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const alterarStatusCliente = async (clienteId: string, novoStatus: string) => {
    setAtualizandoStatus(clienteId)
    
    try {
      console.log('🔧 [ProblemasPanel] Alterando status do cliente:', clienteId, 'para:', novoStatus)
      
      const updates: any = { 
        status_campanha: novoStatus
      }

      // Se está saindo do status Problema, limpar a descrição
      if (novoStatus !== 'Problema') {
        updates.descricao_problema = null
      }

      const { error } = await supabase
        .from('todos_clientes')
        .update(updates)
        .eq('id', parseInt(clienteId))

      if (error) {
        console.error('❌ [ProblemasPanel] Erro ao alterar status:', error)
        toast({
          title: "Erro",
          description: "Erro ao alterar status",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [ProblemasPanel] Status alterado com sucesso')
      toast({
        title: "Sucesso",
        description: `Status alterado para: ${novoStatus}`
      })
      
      // Atualizar a lista
      buscarClientesComProblema()
    } catch (err) {
      console.error('💥 [ProblemasPanel] Erro ao alterar status:', err)
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      })
    } finally {
      setAtualizandoStatus(null)
    }
  }

  useEffect(() => {
    buscarClientesComProblema()
    
    // Configurar realtime para atualizações automáticas
    const channel = supabase
      .channel('problemas-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes',
          filter: 'status_campanha=eq.Problema'
        },
        () => {
          console.log('🔄 [ProblemasPanel] Mudança detectada, atualizando lista...')
          buscarClientesComProblema()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gestorMode, user?.email, isAdmin])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Problemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando problemas...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          {gestorMode ? 'Meus Problemas' : 'Todos os Problemas'} ({clientesComProblema.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientesComProblema.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>Nenhum problema pendente!</p>
            <p className="text-sm">Todos os clientes estão em ordem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição do Problema</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesComProblema.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      {cliente.nome_cliente}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {cliente.email_gestor}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="bg-amber-500/20 text-amber-700 border border-amber-500/30">
                        {cliente.status_campanha}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-wrap break-words">
                          {cliente.descricao_problema || 'Sem descrição'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={atualizandoStatus === cliente.id}
                        onValueChange={(novoStatus) => alterarStatusCliente(cliente.id, novoStatus)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Alterar status..." />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_CAMPANHA.filter(status => status !== 'Problema').map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

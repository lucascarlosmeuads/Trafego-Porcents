
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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

interface ClienteComProblema {
  id: string
  nome_cliente: string
  email_gestor: string
  status_campanha: string
  descricao_problema: string
}

export function ProblemasPanel() {
  const [clientesComProblema, setClientesComProblema] = useState<ClienteComProblema[]>([])
  const [loading, setLoading] = useState(true)
  const [resolvendo, setResolvendo] = useState<string | null>(null)

  const buscarClientesComProblema = async () => {
    try {
      console.log('🔍 [ProblemasPanel] Buscando clientes com status Problema...')
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_gestor, status_campanha, descricao_problema')
        .eq('status_campanha', 'Problema')
        .order('id', { ascending: true })

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

  const marcarComoResolvido = async (clienteId: string) => {
    setResolvendo(clienteId)
    
    try {
      console.log('🔧 [ProblemasPanel] Marcando cliente como resolvido:', clienteId)
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ 
          status_campanha: 'Preenchimento do Formulário',
          descricao_problema: null
        })
        .eq('id', parseInt(clienteId))

      if (error) {
        console.error('❌ [ProblemasPanel] Erro ao resolver problema:', error)
        toast({
          title: "Erro",
          description: "Erro ao marcar como resolvido",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [ProblemasPanel] Problema resolvido com sucesso')
      toast({
        title: "Sucesso",
        description: "Problema marcado como resolvido"
      })
      
      // Atualizar a lista
      buscarClientesComProblema()
    } catch (err) {
      console.error('💥 [ProblemasPanel] Erro ao resolver:', err)
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      })
    } finally {
      setResolvendo(null)
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
  }, [])

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
          Problemas ({clientesComProblema.length})
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => marcarComoResolvido(cliente.id)}
                        disabled={resolvendo === cliente.id}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        {resolvendo === cliente.id ? (
                          'Resolvendo...'
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Marcar como Resolvido
                          </>
                        )}
                      </Button>
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

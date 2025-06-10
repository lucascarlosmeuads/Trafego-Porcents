
import { RefreshCw, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { GestorFormModal } from './GestoresManagement/GestorFormModal'
import { GestorActions } from './GestoresManagement/GestorActions'
import { useGestoresData } from './GestoresManagement/useGestoresData'

export function GestoresManagement() {
  const { user, loading: authLoading } = useAuth()
  const { gestores, loading, refreshing, handleRefresh, fetchGestores } = useGestoresData()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-8">Carregando gestores...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center py-8">Acesso não autorizado</div>
  }

  console.log('🎯 [GESTORES] Renderizando com:', gestores.length, 'gestores')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <CardTitle>Gerenciamento de Gestores ({gestores.length})</CardTitle>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                🔄 Sincronização Total Ativa
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>
              
              <GestorFormModal onGestorCreated={fetchGestores} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>✅ <strong>Sincronização Total:</strong> Criar/excluir gestores aqui reflete automaticamente no Supabase Auth</p>
            <p>🔐 <strong>Acesso Imediato:</strong> Novos gestores podem fazer login assim que forem criados</p>
            <p>👩 <strong>Auto-Detecção:</strong> Carol será adicionada automaticamente se não estiver na lista</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pode Adicionar Cliente</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gestores.map((gestor) => (
                <TableRow key={gestor.id}>
                  <TableCell className="font-medium">{gestor.nome}</TableCell>
                  <TableCell>{gestor.email}</TableCell>
                  <TableCell>
                    <Badge variant={gestor.ativo ? "default" : "secondary"}>
                      {gestor.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={gestor.pode_adicionar_cliente ? "default" : "outline"}>
                      {gestor.pode_adicionar_cliente ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(gestor.created_at)}</TableCell>
                  <TableCell>
                    <GestorActions gestor={gestor} onUpdate={fetchGestores} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {gestores.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-4">Nenhum gestor encontrado</div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

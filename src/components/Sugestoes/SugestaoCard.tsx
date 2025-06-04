
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, CheckCircle, XCircle, Eye, Edit, User, Calendar, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SugestaoMelhoria } from '@/hooks/useSugestoesMelhorias'
import { SugestaoForm } from './SugestaoForm'

interface SugestaoCardProps {
  sugestao: SugestaoMelhoria
  onUpdate?: (id: string, updates: Partial<SugestaoMelhoria>) => Promise<boolean>
  showGestorInfo?: boolean
  onResponder?: (id: string, resposta: string, status: SugestaoMelhoria['status']) => Promise<boolean>
  isAdmin?: boolean
}

export function SugestaoCard({ sugestao, onUpdate, showGestorInfo = true, onResponder, isAdmin = false }: SugestaoCardProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'em_analise':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'aprovada':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejeitada':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'implementada':
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'em_analise':
        return 'Em Análise'
      case 'aprovada':
        return 'Aprovada'
      case 'rejeitada':
        return 'Rejeitada'
      case 'implementada':
        return 'Implementada'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'em_analise':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'aprovada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejeitada':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'implementada':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'bug':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'interface':
        return 'Interface'
      case 'funcionalidade':
        return 'Funcionalidade'
      case 'performance':
        return 'Performance'
      case 'bug':
        return 'Bug'
      case 'outros':
        return 'Outros'
      default:
        return categoria
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const canEdit = sugestao.status === 'pendente' && !isAdmin

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(sugestao.status)}
                <Badge variant="secondary" className={getStatusColor(sugestao.status)}>
                  {getStatusLabel(sugestao.status)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getCategoriaIcon(sugestao.categoria)}
                  {getCategoriaLabel(sugestao.categoria)}
                </Badge>
                <Badge variant="outline" className={getPrioridadeColor(sugestao.prioridade)}>
                  {sugestao.prioridade.charAt(0).toUpperCase() + sugestao.prioridade.slice(1)}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                {sugestao.titulo}
              </h3>
              
              {showGestorInfo && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  <span>{sugestao.gestor_nome}</span>
                  <span>•</span>
                  <span>{sugestao.gestor_email}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(sugestao.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canEdit && onUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Menos' : 'Mais'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className={`text-gray-700 ${expanded ? '' : 'line-clamp-3'}`}>
            {sugestao.descricao}
          </div>

          {sugestao.resposta_admin && (
            <>
              <Separator className="my-4" />
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="font-medium text-blue-900">Resposta do Administrador</span>
                  {sugestao.respondido_em && (
                    <span className="text-sm text-blue-600">
                      • {formatDistanceToNow(new Date(sugestao.respondido_em), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  )}
                </div>
                <p className="text-blue-800">{sugestao.resposta_admin}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showEditForm && onUpdate && (
        <SugestaoForm
          onClose={() => setShowEditForm(false)}
          onSubmit={async (dadosAtualizados) => {
            const sucesso = await onUpdate(sugestao.id, dadosAtualizados)
            if (sucesso) {
              setShowEditForm(false)
            }
            return sucesso
          }}
          gestorEmail={sugestao.gestor_email}
          gestorNome={sugestao.gestor_nome}
          sugestaoInicial={sugestao}
        />
      )}
    </>
  )
}

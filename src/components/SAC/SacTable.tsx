
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Phone, Mail, Calendar } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SacSolicitacao } from '@/hooks/useSacData'

interface SacTableProps {
  solicitacoes: SacSolicitacao[]
  onViewDetails: (solicitacao: SacSolicitacao) => void
}

export function SacTable({ solicitacoes, onViewDetails }: SacTableProps) {
  const isMobile = useIsMobile()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = solicitacoes.slice(startIndex, endIndex)
  const totalPages = Math.ceil(solicitacoes.length / itemsPerPage)

  const getTipoProblemaColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase()
    if (tipoLower.includes('urgente') || tipoLower.includes('crítico')) {
      return 'destructive'
    }
    if (tipoLower.includes('importante') || tipoLower.includes('alta')) {
      return 'secondary'
    }
    return 'outline'
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR })
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {currentItems.map((solicitacao) => (
          <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header do card */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{solicitacao.nome}</h3>
                    <p className="text-sm text-gray-600">{solicitacao.email}</p>
                  </div>
                  <Badge variant={getTipoProblemaColor(solicitacao.tipo_problema)}>
                    {solicitacao.tipo_problema}
                  </Badge>
                </div>

                {/* Informações principais */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`https://wa.me/${solicitacao.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      {solicitacao.whatsapp}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(solicitacao.data_envio)}</span>
                  </div>

                  {solicitacao.nome_gestor && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>Gestor: {solicitacao.nome_gestor}</span>
                    </div>
                  )}
                </div>

                {/* Descrição resumida */}
                <p className="text-sm text-gray-700 line-clamp-2">
                  {solicitacao.descricao}
                </p>

                {/* Botão de ação */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(solicitacao)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Paginação mobile */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 text-sm">
              {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Próximo
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Desktop table
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Gestor</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((solicitacao) => (
            <TableRow key={solicitacao.id} className="hover:bg-gray-50">
              <TableCell className="text-sm">
                {formatDate(solicitacao.data_envio)}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{solicitacao.nome}</div>
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {solicitacao.descricao}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">{solicitacao.email}</TableCell>
              <TableCell>
                <a 
                  href={`https://wa.me/${solicitacao.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline text-sm"
                >
                  {solicitacao.whatsapp}
                </a>
              </TableCell>
              <TableCell>
                <Badge variant={getTipoProblemaColor(solicitacao.tipo_problema)}>
                  {solicitacao.tipo_problema}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {solicitacao.nome_gestor || '-'}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(solicitacao)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginação desktop */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, solicitacoes.length)} de {solicitacoes.length} solicitações
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 2 && page <= currentPage + 2)
              )
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

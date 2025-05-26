
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertCircle, RefreshCw } from 'lucide-react'
import { useBriefingData } from '@/hooks/useBriefingData'

interface BriefingModalProps {
  emailCliente: string
  nomeCliente: string
  trigger: React.ReactNode
}

export function BriefingModal({ emailCliente, nomeCliente, trigger }: BriefingModalProps) {
  const { getBriefingByEmail, loading, refetch } = useBriefingData()
  const [open, setOpen] = useState(false)

  const briefingData = getBriefingByEmail(emailCliente)

  console.log('🔍 [BriefingModal] Dados do briefing para', emailCliente, ':', briefingData)

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const handleRetry = () => {
    console.log('🔄 [BriefingModal] Tentando novamente...')
    refetch()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Briefing - {nomeCliente}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Carregando briefing...</p>
            </div>
          </div>
        )}

        {!loading && !briefingData && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Briefing não encontrado</h3>
            <p className="text-muted-foreground mb-2">
              Não foi possível encontrar o briefing para este cliente.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Email: {emailCliente}
            </p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar novamente
            </Button>
          </div>
        )}

        {!loading && briefingData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Informações do Briefing</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Preenchido em {formatDate(briefingData.created_at)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Nome do Produto/Serviço</h4>
                  <p className="text-foreground">{briefingData.nome_produto || 'Não informado'}</p>
                </div>

                {briefingData.descricao_resumida && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Descrição Resumida</h4>
                    <p className="text-foreground">{briefingData.descricao_resumida}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {briefingData.publico_alvo && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Público Alvo</h4>
                      <p className="text-foreground">{briefingData.publico_alvo}</p>
                    </div>
                  )}
                  {briefingData.diferencial && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Diferencial</h4>
                      <p className="text-foreground">{briefingData.diferencial}</p>
                    </div>
                  )}
                </div>

                {briefingData.investimento_diario && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Investimento Diário</h4>
                    <p className="text-foreground">
                      R$ {Number(briefingData.investimento_diario).toFixed(2)}
                    </p>
                  </div>
                )}

                {briefingData.observacoes_finais && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Observações Finais</h4>
                    <p className="text-foreground">{briefingData.observacoes_finais}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Email do Cliente</h4>
                  <p className="text-foreground text-xs">{briefingData.email_cliente}</p>
                </div>
              </CardContent>
            </Card>

            {briefingData.updated_at !== briefingData.created_at && (
              <div className="text-xs text-muted-foreground text-center">
                Última atualização: {formatDate(briefingData.updated_at)}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

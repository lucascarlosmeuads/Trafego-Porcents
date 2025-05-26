import { useState } from 'react'
import { MoreVertical, Edit, Copy, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Cliente } from '@/lib/supabase'
import { DeleteClientDialog } from './DeleteClientDialog'
import { UpdateStatusDialog } from './UpdateStatusDialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Checkbox } from '@/components/ui/checkbox'
import { useGestorStatusRestrictions } from '@/hooks/useGestorStatusRestrictions'
import { BriefingColumn } from './BriefingColumn'

interface ClienteRowProps {
  cliente: Cliente
  isAdmin: boolean
  userEmail: string
  onUpdate: (id: string, field: string, value: string | boolean | number) => Promise<boolean>
}

export function ClienteRow({ cliente, isAdmin, userEmail, onUpdate }: ClienteRowProps) {
  const { toast } = useToast()
  const [isComissaoPaga, setIsComissaoPaga] = useState(cliente.comissao_paga)
  const [isSaqueSolicitado, setIsSaqueSolicitado] = useState(cliente.saque_solicitado)
  const [siteStatus, setSiteStatus] = useState(cliente.site_status)
  const [descricaoProblema, setDescricaoProblema] = useState(cliente.descricao_problema)
  const [showBriefingColumn, setShowBriefingColumn] = useState(true)
  const { isStatusLocked } = useGestorStatusRestrictions()

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Não definida'
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy', { locale: ptBR })
    } catch (error) {
      console.error('Erro ao formatar a data:', error)
      return 'Data inválida'
    }
  }

  const handleComissaoPagaChange = async (checked: boolean) => {
    const success = await onUpdate(cliente.id.toString(), 'comissao_paga', checked)
    if (success) {
      setIsComissaoPaga(checked)
      toast({
        title: `Comissão ${checked ? 'paga' : 'não paga'}`,
        description: `Comissão de ${cliente.nome_cliente} marcada como ${checked ? 'paga' : 'não paga'}.`
      })
    }
  }

  const handleSaqueSolicitadoChange = async (checked: boolean) => {
    const success = await onUpdate(cliente.id.toString(), 'saque_solicitado', checked)
    if (success) {
      setIsSaqueSolicitado(checked)
      toast({
        title: `Saque ${checked ? 'solicitado' : 'não solicitado'}`,
        description: `Saque de ${cliente.nome_cliente} marcado como ${checked ? 'solicitado' : 'não solicitado'}.`
      })
    }
  }

  const handleSiteStatusChange = async (value: string) => {
    const success = await onUpdate(cliente.id.toString(), 'site_status', value)
    if (success) {
      setSiteStatus(value)
      toast({
        title: 'Status do Site Atualizado',
        description: `Status do site de ${cliente.nome_cliente} atualizado para ${value}.`
      })
    }
  }

  const handleDescricaoProblemaChange = async (value: string) => {
    const success = await onUpdate(cliente.id.toString(), 'descricao_problema', value)
    if (success) {
      setDescricaoProblema(value)
      toast({
        title: 'Descrição do Problema Atualizada',
        description: `Descrição do problema de ${cliente.nome_cliente} atualizada.`
      })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: `${label} copiado para a área de transferência.`
    })
  }

  const isStatusReadOnly = isStatusLocked(cliente.id.toString())

  return (
    <tr className="border-b border-border/50 hover:bg-muted/50 transition-colors">
      <td className="py-3 px-2 font-medium text-sm">{cliente.id}</td>

      <td className="py-3 px-2">
        <div className="flex flex-col">
          <p className="font-medium">{cliente.nome_cliente}</p>
          <p className="text-muted-foreground text-xs">{cliente.email_cliente}</p>
        </div>
      </td>

      <td className="py-3 px-2">
        <UpdateStatusDialog
          cliente={cliente}
          onStatusUpdate={handleSiteStatusChange}
          isStatusReadOnly={isStatusReadOnly}
        />
      </td>

      {showBriefingColumn && (
        <td className="py-3 px-2">
          <BriefingColumn
            emailCliente={cliente.email_cliente}
            nomeCliente={cliente.nome_cliente}
          />
        </td>
      )}

      <td className="py-3 px-2">{cliente.vendedor}</td>

      <td className="py-3 px-2">
        <div className="flex flex-col">
          <p className="font-medium">R$ {cliente.valor_comissao?.toFixed(2)}</p>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`comissao-paga-${cliente.id}`}
              checked={isComissaoPaga}
              onCheckedChange={handleComissaoPagaChange}
            />
            <label
              htmlFor={`comissao-paga-${cliente.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Paga
            </label>
          </div>
        </div>
      </td>

      <td className="py-3 px-2 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => copyToClipboard(cliente.email_cliente, 'Email')}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(cliente.telefone, 'Telefone')}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar Telefone
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Editar Cliente
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem>
                <DeleteClientDialog clienteId={cliente.id} clienteNome={cliente.nome_cliente} />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

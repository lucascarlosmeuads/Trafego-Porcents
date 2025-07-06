
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from '@/hooks/use-toast'
import { useToast as useToastHook } from '@/hooks/use-toast'
import { MoreVertical, Copy, Edit, Trash, UserPlus, FileText, BarChart3 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ClienteMetaAdsModalFixed } from './ClienteMetaAdsModalFixed'

// Usar tipo básico do cliente ao invés de importar
interface Cliente {
  id: number
  nome_cliente: string
  email_cliente: string
  telefone_cliente?: string
  nome_gestor?: string
  data_venda?: string
  status_cliente?: string
}

interface ClienteRowProps {
  cliente: Cliente
  onDelete: (id: number) => Promise<void>
  onUpdate: (id: number, updates: Partial<Cliente>) => Promise<void>
  onTransferencia: (clienteId: number, novoGestorEmail: string) => Promise<void>
  onAddBriefing: (clienteId: number) => Promise<void>
  onEditBriefing: (clienteId: number) => Promise<void>
  canTransfer: boolean
  isAdmin: boolean
  gestores: { email: string; nome: string }[]
  currentUserEmail: string
  isLoading: boolean
}

export function ClienteRow({ 
  cliente, 
  onDelete, 
  onUpdate, 
  onTransferencia, 
  onAddBriefing, 
  onEditBriefing, 
  canTransfer,
  isAdmin,
  gestores,
  currentUserEmail,
  isLoading
}: ClienteRowProps) {
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [briefingModalOpen, setBriefingModalOpen] = useState(false)
  const [briefingEditModalOpen, setBriefingEditModalOpen] = useState(false)
  const [transferirModalOpen, setTransferirModalOpen] = useState(false)
  const [metaAdsModalOpen, setMetaAdsModalOpen] = useState(false)
  const { toast } = useToastHook()

  // Mock do useBriefing - substituir pela lógica real se necessário
  const hasBriefing = false

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(cliente.email_cliente)
    toast({
      title: "Copiado!",
      description: "Email do cliente copiado para a área de transferência.",
    })
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      if (cliente.id) {
        await onDelete(cliente.id)
        toast({
          title: "Sucesso!",
          description: "Cliente deletado com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: "ID do cliente inválido.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error)
      toast({
        title: "Erro",
        description: "Erro ao deletar cliente. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <tr className={`border-b ${isLoading ? 'opacity-50' : ''} hover:bg-gray-50`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.id}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.nome_cliente}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email_cliente}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefone_cliente}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.nome_gestor}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.data_venda}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.status_cliente}</td>
        
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copiar email</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onUpdate(cliente.id, { status_cliente: 'ativo' })}>
                        Ativar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdate(cliente.id, { status_cliente: 'inativo' })}>
                        Inativar
                      </DropdownMenuItem>
                      {canTransfer && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setTransferirModalOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Transferir
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setBriefingModalOpen(true)} disabled={hasBriefing}>
                        <FileText className="h-4 w-4 mr-2" />
                        {hasBriefing ? 'Briefing Adicionado' : 'Adicionar Briefing'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setBriefingEditModalOpen(true)} disabled={!hasBriefing}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Briefing
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDelete} disabled={deleteLoading}>
                        <Trash className="h-4 w-4 mr-2" />
                        {deleteLoading ? 'Deletando...' : 'Deletar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMetaAdsModalOpen(true)}
                  className="text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurar Meta Ads</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          
        </td>
      </tr>

      {/* Modal do Meta Ads */}
      <ClienteMetaAdsModalFixed
        isOpen={metaAdsModalOpen}
        onClose={() => setMetaAdsModalOpen(false)}
        cliente={cliente}
      />
    </>
  )
}

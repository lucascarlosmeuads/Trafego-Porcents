
import React, { useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  X, 
  Edit, 
  Phone, 
  MessageCircle, 
  FolderOpen, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react'
import { Cliente } from '@/lib/supabase'
import { StatusSelect } from './StatusSelect'
import { SiteStatusSelect } from './SiteStatusSelect'
import { ComissaoButton } from './ComissaoButton'
import { BriefingModal } from './BriefingModal'
import { BriefingMaterialsModal } from './BriefingMaterialsModal'

interface ClienteRowProps {
  cliente: Cliente
  selectedManager: string
  index: number
  isAdmin: boolean
  showEmailGestor: boolean
  updatingStatus: string | null
  editingLink: { clienteId: string, field: string } | null
  linkValue: string
  setLinkValue: React.Dispatch<React.SetStateAction<string>>
  editingBM: string | null
  bmValue: string
  setBmValue: React.Dispatch<React.SetStateAction<string>>
  updatingComission: string | null
  editingComissionValue: string | null
  comissionValueInput: string
  setComissionValueInput: React.Dispatch<React.SetStateAction<string>>
  getStatusColor: (status: string) => string
  onStatusChange: (clienteId: string, newStatus: string) => Promise<void>
  onSiteStatusChange: (clienteId: string, newStatus: string) => Promise<void>
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string) => Promise<boolean>
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => Promise<void>
  onBMCancel: () => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => Promise<void>
  onComissionValueCancel: () => void
}

export function ClienteRow({
  cliente,
  selectedManager,
  index,
  isAdmin,
  showEmailGestor,
  updatingStatus,
  editingLink,
  linkValue,
  setLinkValue,
  editingBM,
  bmValue,
  setBmValue,
  updatingComission,
  editingComissionValue,
  comissionValueInput,
  setComissionValueInput,
  getStatusColor,
  onStatusChange,
  onSiteStatusChange,
  onLinkEdit,
  onLinkSave,
  onLinkCancel,
  onBMEdit,
  onBMSave,
  onBMCancel,
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel,
}: ClienteRowProps) {
  const [isBriefingOpen, setIsBriefingOpen] = useState(false)
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') {
      return 'Data não disponível'
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      return 'Data inválida'
    }
  }

  return (
    <TableRow key={cliente.id} className="border-border hover:bg-muted/20">
      <TableCell className="font-medium p-2">{cliente.id}</TableCell>
      <TableCell className="p-2">{formatDate(cliente.data_venda || '')}</TableCell>
      <TableCell className="p-2">{cliente.nome_cliente}</TableCell>
      <TableCell className="p-2">{cliente.telefone}</TableCell>
      <TableCell className="p-2">{cliente.email_cliente}</TableCell>
      {isAdmin && (
        <TableCell className="p-2">{cliente.vendedor}</TableCell>
      )}
      {showEmailGestor && (
        <TableCell className="p-2">{cliente.email_gestor || 'Sem gestor'}</TableCell>
      )}
      <TableCell className="p-2">
        <div className="space-y-2">
          <StatusSelect
            value={cliente.status_campanha || 'Preenchimento do Formulário'}
            getStatusColor={getStatusColor}
            onValueChange={(newStatus) => onStatusChange(cliente.id?.toString() || '', newStatus)}
            disabled={!cliente.id}
            isUpdating={updatingStatus === cliente.id?.toString()}
          />
        </div>
      </TableCell>
      <TableCell className="p-2">{cliente.data_limite}</TableCell>
      <TableCell className="p-2">
        <div className="flex flex-col space-y-1">
          <Button variant="ghost" size="sm" asChild>
            <a href={cliente.link_grupo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3" />
              Grupo
            </a>
          </Button>
          <BriefingModal 
            emailCliente={cliente.email_cliente || ''}
            nomeCliente={cliente.nome_cliente || ''}
            trigger={
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <FolderOpen className="w-3 h-3" />
                Briefing
              </Button>
            }
          />
          <Button variant="ghost" size="sm" onClick={() => setIsMaterialsOpen(true)} className="flex items-center gap-2">
            <FolderOpen className="w-3 h-3" />
            Ver materiais
          </Button>
          <BriefingMaterialsModal isOpen={isMaterialsOpen} onClose={() => setIsMaterialsOpen(false)} cliente={cliente} />
          <Button variant="ghost" size="sm" asChild>
            <a href={`https://wa.me/${cliente.telefone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-500">
              <Phone className="w-3 h-3" />
              WhatsApp
            </a>
          </Button>
        </div>
      </TableCell>

      {/* Coluna Site - COM INDICADOR VISUAL MELHORADO */}
      <TableCell className="p-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SiteStatusSelect
              value={cliente.site_status || 'pendente'}
              onValueChange={(newValue) => onSiteStatusChange(cliente.id?.toString() || '', newValue)}
              disabled={!cliente.id}
              isUpdating={updatingStatus === cliente.id?.toString()}
            />
          </div>
          
          {editingLink?.clienteId === cliente.id?.toString() && editingLink.field === 'link_site' ? (
            <div className="flex gap-1">
              <Input
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                placeholder="https://seusite.com"
                className="h-7 text-xs bg-background border-border text-foreground"
              />
              <Button
                size="sm"
                onClick={() => onLinkSave(cliente.id?.toString() || '')}
                className="h-7 px-2"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onLinkCancel}
                className="h-7 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {cliente.link_site && cliente.link_site.trim() !== '' ? (
                <>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Link adicionado</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLinkEdit(cliente.id?.toString() || '', 'link_site', cliente.link_site || '')}
                    className="h-6 px-2 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </>
              ) : (
                <>
                  {cliente.site_status === 'finalizado' ? (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium">Adicionar link</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Aguardando</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLinkEdit(cliente.id?.toString() || '', 'link_site', '')}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </>
              )}
            </div>
          )}
          
          {cliente.link_site && cliente.link_site.trim() !== '' && (
            <a
              href={cliente.link_site}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Ver site
            </a>
          )}
        </div>
      </TableCell>

      <TableCell className="p-2">
        {editingBM === cliente.id?.toString() ? (
          <div className="flex gap-1">
            <Input
              value={bmValue}
              onChange={(e) => setBmValue(e.target.value)}
              placeholder="Número BM"
              className="h-7 text-xs bg-background border-border text-foreground"
            />
            <Button
              size="sm"
              onClick={() => onBMSave(cliente.id?.toString() || '')}
              className="h-7 px-2"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onBMCancel}
              className="h-7 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs">{cliente.numero_bm || 'Não adicionado'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBMEdit(cliente.id?.toString() || '', cliente.numero_bm || '')}
              className="h-6 px-2 text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="p-2">
        <ComissaoButton 
          cliente={cliente}
          isGestorDashboard={!isAdmin}
          updatingComission={updatingComission}
          editingComissionValue={editingComissionValue}
          comissionValueInput={comissionValueInput}
          setComissionValueInput={setComissionValueInput}
          onComissionToggle={onComissionToggle}
          onComissionValueEdit={onComissionValueEdit}
          onComissionValueSave={onComissionValueSave}
          onComissionValueCancel={onComissionValueCancel}
        />
      </TableCell>
    </TableRow>
  )
}

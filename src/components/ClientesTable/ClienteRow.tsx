
import { useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Copy, CheckCircle, Circle, AlertTriangle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { ComissaoButton } from './ComissaoButton'

interface ClienteRowProps {
  cliente: any
  selectedManager: string
  index: number
  isAdmin: boolean
  showEmailGestor: boolean
  showSitePagoCheckbox: boolean
  updatingStatus: string | null
  editingLink: { clienteId: string, field: string } | null
  linkValue: string
  setLinkValue: (value: string) => void
  editingBM: string | null
  bmValue: string
  setBmValue: (value: string) => void
  updatingComission: string | null
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
  onSitePagoChange: (clienteId: string, newValue: boolean) => Promise<void>
}

export function ClienteRow({
  cliente,
  selectedManager,
  index,
  isAdmin,
  showEmailGestor,
  showSitePagoCheckbox,
  updatingStatus,
  editingLink,
  linkValue,
  setLinkValue,
  editingBM,
  bmValue,
  setBmValue,
  updatingComission,
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
  onSitePagoChange,
  refetchData
}: ClienteRowProps & { refetchData?: () => void }) {
  const [isCopied, setIsCopied] = useState(false)
  const clienteId = cliente.id?.toString() || ''
  const isLinkEditing = editingLink?.clienteId === clienteId
  const isBMEditing = editingBM === clienteId
  const isUpdating = updatingStatus === clienteId

  const handleCopyClick = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    toast({
      title: "Copiado!",
      description: "O texto foi copiado para a área de transferência.",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSitePagoChange = (checked: boolean | string) => {
    // Ensure we only pass boolean values
    const booleanValue = typeof checked === 'boolean' ? checked : false
    onSitePagoChange(clienteId, booleanValue)
  }

  return (
    <TableRow 
      className={`border-border hover:bg-muted/20 ${
        index % 2 === 0 ? 'bg-muted/5' : 'bg-transparent'
      }`}
    >
      <TableCell className="font-medium p-2">{cliente.id}</TableCell>
      <TableCell className="p-2">{cliente.data_venda}</TableCell>
      <TableCell className="p-2">{cliente.nome_cliente}</TableCell>
      <TableCell className="p-2">
        {cliente.telefone}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleCopyClick(cliente.telefone)}
          disabled={isCopied}
        >
          {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </TableCell>
      <TableCell className="p-2">
        {cliente.email_cliente}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleCopyClick(cliente.email_cliente)}
          disabled={isCopied}
        >
          {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </TableCell>
      <TableCell className="p-2">{cliente.vendedor}</TableCell>
      {showEmailGestor && (
        <TableCell className="p-2">
          {cliente.email_gestor}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCopyClick(cliente.email_gestor || '')}
            disabled={isCopied}
          >
            {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </TableCell>
      )}
      <TableCell className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-[150px]">
              <span className="line-clamp-1">{cliente.status_campanha || 'Sem Status'}</span>
              <MoreHorizontal className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Selecione o status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_CAMPANHA.map((status) => (
              <DropdownMenuItem 
                key={status}
                onClick={() => onStatusChange(clienteId, status)}
                className="cursor-pointer"
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {isUpdating && (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
              <Circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}
        {!cliente.status_campanha && (
          <Badge variant="outline" className="mt-2">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Sem status
          </Badge>
        )}
        {cliente.status_campanha && (
          <Badge variant="secondary" className={`mt-2 ${getStatusColor(cliente.status_campanha)}`}>
            {cliente.status_campanha}
          </Badge>
        )}
      </TableCell>
      <TableCell className="p-2">{cliente.data_limite}</TableCell>
      <TableCell className="p-2">
        {isLinkEditing && editingLink.field === 'link_briefing' ? (
          <div className="flex items-center">
            <Input
              type="text"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              className="mr-2"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onLinkSave(clienteId)}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onLinkCancel}
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <a href={cliente.link_briefing} target="_blank" rel="noopener noreferrer" className="hover:underline line-clamp-1 max-w-[200px]">
              {cliente.link_briefing || 'Sem link'}
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLinkEdit(clienteId, 'link_briefing', cliente.link_briefing)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="p-2">
        {isLinkEditing && editingLink.field === 'link_criativo' ? (
          <div className="flex items-center">
            <Input
              type="text"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              className="mr-2"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onLinkSave(clienteId)}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onLinkCancel}
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <a href={cliente.link_criativo} target="_blank" rel="noopener noreferrer" className="hover:underline line-clamp-1 max-w-[200px]">
              {cliente.link_criativo || 'Sem link'}
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLinkEdit(clienteId, 'link_criativo', cliente.link_criativo)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="p-2">
        {isLinkEditing && editingLink.field === 'link_site' ? (
          <div className="flex items-center">
            <Input
              type="text"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              className="mr-2"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onLinkSave(clienteId)}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onLinkCancel}
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <a href={cliente.link_site} target="_blank" rel="noopener noreferrer" className="hover:underline line-clamp-1 max-w-[200px]">
              {cliente.link_site || 'Sem link'}
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLinkEdit(clienteId, 'link_site', cliente.link_site)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="p-2">
        {isBMEditing ? (
          <div className="flex items-center">
            <Input
              type="text"
              value={bmValue}
              onChange={(e) => setBmValue(e.target.value)}
              className="mr-2"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onBMSave(clienteId)}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onBMCancel}
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <span>{cliente.numero_bm || 'Sem BM'}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onBMEdit(clienteId, cliente.numero_bm || '')}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
      {showSitePagoCheckbox && (
        <TableCell className="p-2">
          <Checkbox
            checked={cliente.site_pago || false}
            onCheckedChange={handleSitePagoChange}
          />
        </TableCell>
      )}
      <TableCell className="p-2">
        <ComissaoButton
          cliente={cliente}
          isAdmin={isAdmin}
          updatingComission={updatingComission}
          onComissionToggle={onComissionToggle}
          refetchData={refetchData}
          compact={true}
        />
      </TableCell>
    </TableRow>
  )
}

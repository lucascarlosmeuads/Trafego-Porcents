
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Cliente, STATUS_CAMPANHA } from '@/lib/supabase'

interface UpdateStatusDialogProps {
  cliente: Cliente
  onStatusUpdate: (status: string) => void
  isStatusReadOnly?: boolean
}

export function UpdateStatusDialog({ cliente, onStatusUpdate, isStatusReadOnly }: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preenchimento do Formulário':
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
      case 'Brief':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
      case 'Criativo':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      case 'Site':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
      case 'Agendamento':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
      case 'No Ar':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      case 'Otimização':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
      case 'Problema':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
      case 'Off':
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
      case 'Reembolso':
        return 'bg-red-500/20 text-red-300 border border-red-500/30'
      case 'Saque Pendente':
        return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
  }

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate(newStatus)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost" 
          size="sm" 
          className={`p-2 h-auto ${getStatusColor(cliente.status_campanha || '')}`}
          disabled={isStatusReadOnly}
        >
          {cliente.status_campanha || 'Sem status'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Status - {cliente.nome_cliente}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status da Campanha:</label>
            <Select onValueChange={handleStatusChange} defaultValue={cliente.status_campanha || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_CAMPANHA.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

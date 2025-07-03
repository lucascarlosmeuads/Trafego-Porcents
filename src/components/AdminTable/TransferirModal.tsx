
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserX } from 'lucide-react'
import { Cliente } from '@/lib/supabase'

interface TransferirModalProps {
  cliente: Cliente
  onTransferirCliente: (clienteId: string, novoEmailGestor: string) => void
  isLoading: boolean
  gestores: Array<{ email: string, nome: string }>
}

export function TransferirModal({ cliente, onTransferirCliente, isLoading, gestores }: TransferirModalProps) {
  const [novoEmailGestor, setNovoEmailGestor] = useState('')
  const [open, setOpen] = useState(false)

  const handleTransferir = () => {
    if (!novoEmailGestor) return
    onTransferirCliente(String(cliente.id), novoEmailGestor)
    setOpen(false)
    setNovoEmailGestor('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <UserX className="w-3 h-3 mr-1" />
          Transferir
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Transferir Cliente: {cliente.nome_cliente}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Gestor Atual: {cliente.email_gestor}
            </label>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Novo Gestor:
            </label>
            <Select value={novoEmailGestor} onValueChange={setNovoEmailGestor}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione um gestor..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {gestores.map((gestor) => (
                  <SelectItem key={gestor.email} value={gestor.email}>
                    {gestor.nome} ({gestor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleTransferir} 
              disabled={!novoEmailGestor || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferindo...
                </>
              ) : (
                'Confirmar Transferência'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

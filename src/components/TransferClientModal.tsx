
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase, type Cliente, type Gestor } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Users, ArrowRight } from 'lucide-react'

interface TransferClientModalProps {
  cliente: Cliente | null
  isOpen: boolean
  onClose: () => void
  onTransferComplete: () => void
}

export function TransferClientModal({ cliente, isOpen, onClose, onTransferComplete }: TransferClientModalProps) {
  const [gestores, setGestores] = useState<Gestor[]>([])
  const [selectedGestor, setSelectedGestor] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchGestores()
    }
  }, [isOpen])

  const fetchGestores = async () => {
    try {
      const { data, error } = await supabase
        .from('gestores')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('Erro ao buscar gestores:', error)
        return
      }

      setGestores(data || [])
    } catch (error) {
      console.error('Erro ao carregar gestores:', error)
    }
  }

  const handleTransfer = async () => {
    if (!cliente || !selectedGestor) {
      toast({
        title: "Erro",
        description: "Selecione um gestor para transferir o cliente",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      console.log(`🔄 Transferindo cliente ${cliente.id} para gestor: ${selectedGestor}`)
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ email_gestor: selectedGestor })
        .eq('id', cliente.id)

      if (error) {
        console.error('Erro ao transferir cliente:', error)
        toast({
          title: "Erro",
          description: `Erro ao transferir cliente: ${error.message}`,
          variant: "destructive"
        })
        return
      }

      const gestorNome = gestores.find(g => g.email === selectedGestor)?.nome || selectedGestor

      toast({
        title: "Cliente transferido!",
        description: `${cliente.nome_cliente} foi transferido para ${gestorNome}`,
      })

      console.log('✅ Cliente transferido com sucesso')
      onTransferComplete()
      onClose()
      setSelectedGestor('')
    } catch (error) {
      console.error('Erro ao transferir:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao transferir cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedGestor('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Transferir Cliente
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {cliente && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{cliente.nome_cliente}</p>
              <p className="text-sm text-muted-foreground">
                Gestor atual: {cliente.email_gestor}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Transferir para:</label>
            <Select value={selectedGestor} onValueChange={setSelectedGestor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gestor de destino" />
              </SelectTrigger>
              <SelectContent>
                {gestores
                  .filter(gestor => gestor.email !== cliente?.email_gestor)
                  .map(gestor => (
                    <SelectItem key={gestor.id} value={gestor.email}>
                      {gestor.nome} ({gestor.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleTransfer} 
              disabled={!selectedGestor || loading}
              className="gap-2"
            >
              {loading ? (
                "Transferindo..."
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Transferir
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

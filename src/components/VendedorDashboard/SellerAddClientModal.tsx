
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NewSellerAddClientForm } from './NewSellerAddClientForm'

interface SellerAddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onAddClient: (clientData: any) => Promise<any>
  isLoading: boolean
}

export function SellerAddClientModal({ 
  isOpen, 
  onClose, 
  onAddClient, 
  isLoading 
}: SellerAddClientModalProps) {
  console.log('🎯 [SellerAddClientModal] Modal renderizado - Valor padrão R$60,00')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Adicionar Novo Cliente
            <span className="block text-sm text-green-600 font-normal mt-1">
              💰 Valor padrão da comissão: R$60,00
            </span>
          </DialogTitle>
        </DialogHeader>
        <NewSellerAddClientForm
          onAddClient={onAddClient}
          isLoading={isLoading}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}

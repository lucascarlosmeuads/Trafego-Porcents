
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ClientInstructionsModalProps {
  isOpen: boolean
  onClose: () => void
  clientEmail: string
  clientName: string
}

export function ClientInstructionsModal({ isOpen, onClose, clientEmail, clientName }: ClientInstructionsModalProps) {
  const [copied, setCopied] = useState(false)

  const instructions = `✅ Cliente cadastrado com sucesso!

⚠️ Agora, envie para o cliente as seguintes instruções:

Olá ${clientName},

1. Acesse o link: https://login.trafegoporcents.com
2. Clique em "Criar Conta"
3. Use este mesmo e-mail: ${clientEmail}
4. Escolha uma senha segura (ex: cliente123)
5. Após o cadastro, você verá o painel com os materiais e campanhas atribuídas

Qualquer dúvida, entre em contato conosco!`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instructions)
      setCopied(true)
      toast({
        title: "Copiado!",
        description: "Instruções copiadas para a área de transferência"
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar as instruções",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-green-600">Cliente Cadastrado com Sucesso!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Próximos Passos</h3>
            <p className="text-yellow-700 text-sm">
              Copie as instruções abaixo e envie para o cliente via WhatsApp, e-mail ou outro meio de comunicação.
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4 relative">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {instructions}
            </pre>
            
            <Button
              onClick={handleCopy}
              size="sm"
              className="absolute top-2 right-2"
              variant={copied ? "default" : "outline"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose} className="w-full">
              Entendi, fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

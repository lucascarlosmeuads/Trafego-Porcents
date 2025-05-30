
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

  const instructions = `Olá ${clientName}! 🎉

Conta criada com sucesso! Para acessar aqui está seu email e sua senha:

📧 Email: ${clientEmail}
🔐 Senha: parceriadesucesso

🔗 Acesse: https://login.trafegoporcents.com

O passo a passo com as instruções vai estar logo na primeira tela assim que logar. Seja bem-vindo!

🚨 Aguarde 1 dia pela criação do grupo. Se não for criado hoje, no máximo no outro dia cedo será criado. Fique tranquilo!

Qualquer dúvida, estamos aqui para ajudar! 💪`

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
          <DialogTitle className="text-green-600">✅ Cliente cadastrado com sucesso!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Próximos Passos</h3>
            <p className="text-yellow-700 text-sm">
              Agora, envie para o cliente a seguinte mensagem no WhatsApp do cliente.
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4 relative">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
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

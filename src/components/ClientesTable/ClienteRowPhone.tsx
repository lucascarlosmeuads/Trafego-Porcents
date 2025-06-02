
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ClienteRowPhoneProps {
  telefone: string
  nomeCliente: string
}

export function ClienteRowPhone({ telefone, nomeCliente }: ClienteRowPhoneProps) {
  const formatPhone = (phone: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const openWhatsApp = (phone: string, name: string) => {
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    const message = `Olá ${name}! Sou da equipe de tráfego pago. Como posso te ajudar?`
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center">
        {telefone ? (
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 border-green-600 text-white"
                onClick={() => openWhatsApp(telefone, nomeCliente || 'Cliente')}
                title="Abrir WhatsApp"
              >
                WhatsApp
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{formatPhone(telefone)}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 border-gray-600 text-white"
                disabled
              >
                WhatsApp
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Telefone não informado</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

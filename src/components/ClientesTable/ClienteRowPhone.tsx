
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

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
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs">
        {formatPhone(telefone || '')}
      </span>
      {telefone && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700 border-green-600"
          onClick={() => openWhatsApp(telefone, nomeCliente || 'Cliente')}
          title="Abrir WhatsApp"
        >
          <MessageCircle className="h-3 w-3 text-white" />
        </Button>
      )}
    </div>
  )
}

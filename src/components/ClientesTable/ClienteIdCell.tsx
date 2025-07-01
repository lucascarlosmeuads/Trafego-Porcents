
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ClienteIdCellProps {
  clienteId: string
}

export function ClienteIdCell({ clienteId }: ClienteIdCellProps) {
  const [isIdCopied, setIsIdCopied] = useState<boolean>(false)
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsIdCopied(true)
    toast({
      title: "Copiado!",
      description: "ID do cliente copiado para a área de transferência.",
    })
    setTimeout(() => setIsIdCopied(false), 2000)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="max-w-[220px] truncate font-medium">{clienteId}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 data-[state=open]:bg-muted"
              onClick={() => copyToClipboard(clienteId)}
              disabled={isIdCopied}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copiar ID</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {isIdCopied ? "ID copiado!" : "Copiar ID"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

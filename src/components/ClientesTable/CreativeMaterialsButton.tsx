
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreativeFiles } from '@/hooks/useCreativeFiles'

interface CreativeMaterialsButtonProps {
  emailCliente: string
  nomeCliente: string
  trigger: React.ReactNode
}

export function CreativeMaterialsButton({ emailCliente, nomeCliente }: CreativeMaterialsButtonProps) {
  const { hasCreativeFiles, loading } = useCreativeFiles(emailCliente)

  if (loading) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className="h-8 bg-gray-500 border-gray-500 text-white"
      >
        <Eye className="h-3 w-3 mr-1" />
        Carregando...
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={`h-8 ${
        hasCreativeFiles 
          ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
          : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'
      }`}
    >
      <Eye className="h-3 w-3 mr-1" />
      Ver materiais
    </Button>
  )
}

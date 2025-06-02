
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { createJoaoLadislau } from '@/utils/createSellerUser'

export function CreateSellerUserButton() {
  const [loading, setLoading] = useState(false)

  const handleCreateUser = async () => {
    setLoading(true)
    try {
      await createJoaoLadislau()
      
      toast({
        title: "✅ Vendedor criado com sucesso!",
        description: "João Ladislau (joao.ladislau1@hotmail.com) foi criado no sistema. Senha: vendedor123",
        duration: 5000
      })
      
    } catch (error) {
      console.error('Erro ao criar vendedor:', error)
      toast({
        title: "❌ Erro ao criar vendedor",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        Criar Vendedor João Ladislau
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        Clique no botão abaixo para criar o usuário vendedor João Ladislau no sistema.
      </p>
      <div className="space-y-2">
        <p className="text-xs text-gray-600">
          <strong>Email:</strong> joao.ladislau1@hotmail.com
        </p>
        <p className="text-xs text-gray-600">
          <strong>Senha:</strong> vendedor123
        </p>
        <p className="text-xs text-gray-600">
          <strong>Tipo:</strong> Vendedor
        </p>
      </div>
      
      <Button 
        onClick={handleCreateUser} 
        disabled={loading}
        className="mt-4 w-full"
      >
        {loading ? 'Criando vendedor...' : 'Criar Vendedor João Ladislau'}
      </Button>
    </div>
  )
}

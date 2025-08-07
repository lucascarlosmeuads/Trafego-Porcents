import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export function CreateParceiraUser() {
  const [email, setEmail] = useState('flavio.poty@hotmail.com')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const createUser = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Email é obrigatório",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('🚀 Criando usuário para:', email)

      // Chamar a edge function
      const { data, error } = await supabase.functions.invoke('create-parceria-user', {
        body: { email: email.trim() }
      })

      if (error) {
        console.error('❌ Erro na edge function:', error)
        toast({
          title: "Erro",
          description: `Falha ao criar usuário: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      console.log('✅ Resposta da edge function:', data)

      if (data.success) {
        toast({
          title: "Sucesso",
          description: data.user_exists 
            ? `Usuário ${email} já existia no sistema`
            : `Usuário ${email} criado com sucesso! Senha: soumilionario`,
        })
      } else {
        toast({
          title: "Erro",
          description: data.error || 'Erro desconhecido',
          variant: "destructive",
        })
      }

    } catch (error: any) {
      console.error('❌ Erro inesperado:', error)
      toast({
        title: "Erro",
        description: `Erro inesperado: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Usuário Auth - Cliente Parceria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email do Cliente
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>
        
        <Button 
          onClick={createUser} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Criando...' : 'Criar Usuário Auth'}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p><strong>Senha padrão:</strong> soumilionario</p>
          <p>Esta função cria o usuário no Supabase Auth para que ele possa fazer login no painel.</p>
        </div>
      </CardContent>
    </Card>
  )
}
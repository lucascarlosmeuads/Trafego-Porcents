
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { Users, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface EmailStatus {
  email: string
  status: 'pending' | 'success' | 'error' | 'exists'
  message?: string
}

export function CriarContasClientes() {
  const [emails, setEmails] = useState<EmailStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const buscarEmailsClientes = async () => {
    try {
      setLoading(true)
      
      // Buscar todos os emails únicos da tabela todos_clientes
      const { data: clientes, error } = await supabase
        .from('todos_clientes')
        .select('email_cliente')
        .not('email_cliente', 'is', null)
        .not('email_cliente', 'eq', '')

      if (error) {
        throw error
      }

      // Filtrar emails únicos e válidos
      const emailsUnicos = Array.from(
        new Set(
          clientes
            ?.map(c => c.email_cliente?.trim().toLowerCase())
            .filter(email => email && email.includes('@'))
        )
      )

      console.log(`Encontrados ${emailsUnicos.length} emails únicos`)

      const emailsStatus: EmailStatus[] = emailsUnicos.map(email => ({
        email: email!,
        status: 'pending'
      }))

      setEmails(emailsStatus)
      setProgress(0)

    } catch (error) {
      console.error('Erro ao buscar emails:', error)
      toast({
        title: "Erro",
        description: "Erro ao buscar emails dos clientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const criarContasAutomaticamente = async () => {
    if (emails.length === 0) {
      toast({
        title: "Aviso",
        description: "Primeiro busque os emails dos clientes",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i]
      
      try {
        // Verificar se o usuário já existe
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const userExists = existingUsers.users.some(user => 
          user.email?.toLowerCase() === email.email.toLowerCase()
        )

        if (userExists) {
          setEmails(prev => prev.map((e, idx) => 
            idx === i ? { ...e, status: 'exists', message: 'Conta já existe' } : e
          ))
        } else {
          // Criar conta com senha temporária
          const senhaTemporaria = `Cliente${Math.random().toString(36).slice(-8)}`
          
          const { data, error } = await supabase.auth.admin.createUser({
            email: email.email,
            password: senhaTemporaria,
            email_confirm: true // Confirmar email automaticamente
          })

          if (error) {
            throw error
          }

          setEmails(prev => prev.map((e, idx) => 
            idx === i ? { 
              ...e, 
              status: 'success', 
              message: `Conta criada! Senha: ${senhaTemporaria}` 
            } : e
          ))

          console.log(`Conta criada para ${email.email} com senha: ${senhaTemporaria}`)
        }
        
      } catch (error: any) {
        console.error(`Erro ao criar conta para ${email.email}:`, error)
        setEmails(prev => prev.map((e, idx) => 
          idx === i ? { 
            ...e, 
            status: 'error', 
            message: error.message || 'Erro desconhecido' 
          } : e
        ))
      }

      // Atualizar progresso
      setProgress(((i + 1) / emails.length) * 100)
      
      // Pequena pausa para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setLoading(false)
    
    const sucessos = emails.filter(e => e.status === 'success').length
    const existentes = emails.filter(e => e.status === 'exists').length
    const erros = emails.filter(e => e.status === 'error').length

    toast({
      title: "Processo concluído!",
      description: `✅ ${sucessos} criadas | ℹ️ ${existentes} já existiam | ❌ ${erros} erros`
    })
  }

  const getStatusIcon = (status: EmailStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'exists':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Mail className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: EmailStatus['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Criada</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
      case 'exists':
        return <Badge className="bg-yellow-100 text-yellow-800">Já existe</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Criar Contas para Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={buscarEmailsClientes}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Buscando...' : '1. Buscar Emails dos Clientes'}
            </Button>
            
            <Button 
              onClick={criarContasAutomaticamente}
              disabled={loading || emails.length === 0}
            >
              {loading ? 'Criando contas...' : '2. Criar Contas Automaticamente'}
            </Button>
          </div>

          {loading && progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Criando contas...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {emails.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Total de emails encontrados: {emails.length}
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {emails.map((emailStatus, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(emailStatus.status)}
                      <span className="font-mono text-sm">{emailStatus.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(emailStatus.status)}
                      {emailStatus.message && emailStatus.status === 'success' && (
                        <span className="text-xs text-muted-foreground max-w-xs truncate">
                          {emailStatus.message}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-medium text-blue-800 mb-2">⚠️ Importante:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• As senhas temporárias serão exibidas apenas uma vez</li>
            <li>• Copie e guarde as senhas para enviar aos clientes</li>
            <li>• Os clientes poderão alterar a senha no primeiro login</li>
            <li>• Emails já cadastrados não serão duplicados</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

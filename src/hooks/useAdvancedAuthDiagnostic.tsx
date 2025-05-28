
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { DiagnosticResult, DiagnosticIssue, DiagnosticCorrection, DiagnosticProgress } from '@/components/AuthDiagnostic/DiagnosticTypes'
import type { User } from '@supabase/supabase-js'

export function useAdvancedAuthDiagnostic() {
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [progress, setProgress] = useState<DiagnosticProgress | null>(null)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const { toast } = useToast()

  const updateProgress = (step: string, progress: number, message: string) => {
    setProgress({ step, progress, message })
    console.log(`🔧 [Diagnostic] ${step}: ${message} (${progress}%)`)
  }

  const runCompleteDiagnostic = async (email: string) => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email para diagnosticar",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setProgress(null)
    setResult(null)

    const normalizedEmail = email.toLowerCase().trim()
    console.log('🔍 [AdvancedDiagnostic] === DIAGNÓSTICO COMPLETO ===')
    console.log('📧 [AdvancedDiagnostic] Email:', normalizedEmail)

    try {
      const diagnosticResult: DiagnosticResult = {
        email: normalizedEmail,
        clienteExistsInDatabase: false,
        userExistsInAuth: false,
        emailConfirmed: false,
        canLogin: false,
        issues: [],
        corrections: []
      }

      // 1. Verificar cliente na base de dados
      updateProgress("Verificando cliente", 20, "Consultando base de dados...")
      
      const { data: clientes, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente')
        .eq('email_cliente', normalizedEmail)

      if (clienteError) {
        console.error('❌ [AdvancedDiagnostic] Erro ao buscar cliente:', clienteError)
      }

      if (clientes && clientes.length > 0) {
        diagnosticResult.clienteExistsInDatabase = true
        diagnosticResult.clienteData = clientes[0]
        
        if (clientes.length > 1) {
          diagnosticResult.duplicateClientes = clientes
          diagnosticResult.issues.push({
            type: 'duplicate_clients',
            severity: 'warning',
            description: `Encontrados ${clientes.length} registros duplicados na base`,
            solution: 'Consolidar registros duplicados'
          })
        }
        
        console.log('✅ [AdvancedDiagnostic] Cliente encontrado:', clientes[0].nome_cliente)
      } else {
        diagnosticResult.issues.push({
          type: 'missing_client',
          severity: 'critical',
          description: 'Cliente não encontrado na base de dados',
          solution: 'Cadastrar cliente na base ou verificar email correto'
        })
        console.log('❌ [AdvancedDiagnostic] Cliente não encontrado na base')
      }

      // 2. Verificar usuário no Auth
      updateProgress("Verificando autenticação", 40, "Testando credenciais...")
      
      let authUser = null
      let loginError = null
      
      try {
        // Tentar login de teste
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: 'parceriadesucesso'
        })
        
        if (!loginErr && loginData.user) {
          diagnosticResult.userExistsInAuth = true
          diagnosticResult.emailConfirmed = loginData.user.email_confirmed_at !== null
          diagnosticResult.canLogin = true
          authUser = loginData.user
          
          // Fazer logout imediato
          await supabase.auth.signOut()
          
          console.log('✅ [AdvancedDiagnostic] Login bem-sucedido')
        } else {
          loginError = loginErr
          console.log('❌ [AdvancedDiagnostic] Erro no login:', loginErr?.message)
        }
      } catch (error) {
        loginError = error
        console.log('❌ [AdvancedDiagnostic] Erro no teste de login:', error)
      }

      // 3. Analisar problemas específicos
      updateProgress("Analisando problemas", 60, "Identificando issues...")
      
      if (loginError) {
        if (loginError.message?.includes('Invalid login credentials')) {
          // Pode ser usuário inexistente ou senha errada
          try {
            // Tentar verificar se usuário existe tentando reset de senha
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
              redirectTo: 'https://example.com' // URL dummy só para testar
            })
            
            if (!resetError) {
              diagnosticResult.userExistsInAuth = true
              diagnosticResult.issues.push({
                type: 'wrong_password',
                severity: 'critical',
                description: 'Usuário existe mas senha está incorreta',
                solution: 'Resetar senha para "parceriadesucesso"'
              })
            } else {
              diagnosticResult.issues.push({
                type: 'missing_user',
                severity: 'critical', 
                description: 'Usuário não existe no sistema de autenticação',
                solution: 'Criar usuário com senha "parceriadesucesso"'
              })
            }
          } catch (error) {
            diagnosticResult.issues.push({
              type: 'missing_user',
              severity: 'critical',
              description: 'Usuário não existe no sistema de autenticação',
              solution: 'Criar usuário com senha "parceriadesucesso"'
            })
          }
        } else if (loginError.message?.includes('Email not confirmed')) {
          diagnosticResult.userExistsInAuth = true
          diagnosticResult.emailConfirmed = false
          diagnosticResult.issues.push({
            type: 'unconfirmed_email',
            severity: 'critical',
            description: 'Email não confirmado no sistema',
            solution: 'Confirmar email automaticamente'
          })
        } else {
          diagnosticResult.issues.push({
            type: 'unknown',
            severity: 'critical',
            description: `Erro desconhecido: ${loginError.message}`,
            solution: 'Recriar usuário do zero'
          })
        }
      }

      // 4. Gerar mensagem para o cliente
      updateProgress("Gerando relatório", 80, "Preparando correções...")
      
      if (diagnosticResult.issues.length === 0) {
        diagnosticResult.clientMessage = generateSuccessMessage(normalizedEmail, diagnosticResult.clienteData?.nome_cliente)
      } else {
        diagnosticResult.clientMessage = generateIssueMessage(normalizedEmail, diagnosticResult.issues, diagnosticResult.clienteData?.nome_cliente)
      }

      updateProgress("Concluído", 100, "Diagnóstico finalizado")
      setResult(diagnosticResult)
      
      console.log('🔍 [AdvancedDiagnostic] Resultado final:', diagnosticResult)

    } catch (error) {
      console.error('💥 [AdvancedDiagnostic] Erro crítico:', error)
      toast({
        title: "Erro no Diagnóstico",
        description: "Erro inesperado durante o diagnóstico",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  const applyCorrections = async (diagnosticResult: DiagnosticResult) => {
    if (!diagnosticResult) return

    setFixing(true)
    const corrections: DiagnosticCorrection[] = []
    
    console.log('🔧 [AdvancedDiagnostic] Aplicando correções para:', diagnosticResult.email)

    try {
      for (const issue of diagnosticResult.issues) {
        console.log('🔧 [AdvancedDiagnostic] Corrigindo:', issue.type)
        
        switch (issue.type) {
          case 'missing_user':
            await correctMissingUser(diagnosticResult.email, corrections)
            break
            
          case 'wrong_password':
            await correctWrongPassword(diagnosticResult.email, corrections)
            break
            
          case 'unconfirmed_email':
            await correctUnconfirmedEmail(diagnosticResult.email, corrections)
            break
            
          case 'duplicate_clients':
            await correctDuplicateClients(diagnosticResult.email, corrections)
            break
            
          default:
            corrections.push({
              action: `Correção para ${issue.type}`,
              status: 'failed',
              message: 'Tipo de correção não implementado'
            })
        }
      }

      // Atualizar resultado com correções
      const updatedResult = {
        ...diagnosticResult,
        corrections,
        clientMessage: generateCorrectionMessage(diagnosticResult.email, corrections, diagnosticResult.clienteData?.nome_cliente)
      }
      
      setResult(updatedResult)

      const successCount = corrections.filter(c => c.status === 'success').length
      const totalCount = corrections.length

      if (successCount === totalCount) {
        toast({
          title: "Correções Aplicadas",
          description: `Todas as ${successCount} correções foram aplicadas com sucesso`
        })
      } else {
        toast({
          title: "Correções Parciais",
          description: `${successCount} de ${totalCount} correções aplicadas`,
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('💥 [AdvancedDiagnostic] Erro nas correções:', error)
      toast({
        title: "Erro nas Correções",
        description: "Erro inesperado durante as correções",
        variant: "destructive"
      })
    } finally {
      setFixing(false)
    }
  }

  const correctMissingUser = async (email: string, corrections: DiagnosticCorrection[]) => {
    try {
      console.log('🔧 [AdvancedDiagnostic] Criando usuário:', email)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: 'parceriadesucesso',
        email_confirm: true
      })

      if (error) throw error

      corrections.push({
        action: 'Criar usuário no sistema',
        status: 'success',
        message: 'Usuário criado com sucesso',
        timestamp: new Date().toISOString()
      })
      
      console.log('✅ [AdvancedDiagnostic] Usuário criado:', data.user?.id)
    } catch (error: any) {
      console.error('❌ [AdvancedDiagnostic] Erro ao criar usuário:', error)
      corrections.push({
        action: 'Criar usuário no sistema',
        status: 'failed',
        message: `Erro: ${error.message}`
      })
    }
  }

  const correctWrongPassword = async (email: string, corrections: DiagnosticCorrection[]) => {
    try {
      console.log('🔧 [AdvancedDiagnostic] Atualizando senha:', email)
      
      // Primeiro buscar o usuário pelo email
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users.users.find((u: User) => u.email === email)
      
      if (!user) throw new Error('Usuário não encontrado')

      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password: 'parceriadesucesso'
      })

      if (error) throw error

      corrections.push({
        action: 'Resetar senha do usuário',
        status: 'success',
        message: 'Senha resetada para "parceriadesucesso"',
        timestamp: new Date().toISOString()
      })
      
      console.log('✅ [AdvancedDiagnostic] Senha atualizada')
    } catch (error: any) {
      console.error('❌ [AdvancedDiagnostic] Erro ao resetar senha:', error)
      corrections.push({
        action: 'Resetar senha do usuário',
        status: 'failed',
        message: `Erro: ${error.message}`
      })
    }
  }

  const correctUnconfirmedEmail = async (email: string, corrections: DiagnosticCorrection[]) => {
    try {
      console.log('🔧 [AdvancedDiagnostic] Confirmando email:', email)
      
      // Buscar o usuário pelo email
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users.users.find((u: User) => u.email === email)
      
      if (!user) throw new Error('Usuário não encontrado')

      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true
      })

      if (error) throw error

      corrections.push({
        action: 'Confirmar email do usuário',
        status: 'success',
        message: 'Email confirmado automaticamente',
        timestamp: new Date().toISOString()
      })
      
      console.log('✅ [AdvancedDiagnostic] Email confirmado')
    } catch (error: any) {
      console.error('❌ [AdvancedDiagnostic] Erro ao confirmar email:', error)
      corrections.push({
        action: 'Confirmar email do usuário',
        status: 'failed',
        message: `Erro: ${error.message}`
      })
    }
  }

  const correctDuplicateClients = async (email: string, corrections: DiagnosticCorrection[]) => {
    corrections.push({
      action: 'Consolidar registros duplicados',
      status: 'failed',
      message: 'Correção manual necessária - contactar admin'
    })
  }

  const generateSuccessMessage = (email: string, nome?: string) => {
    return `✅ DIAGNÓSTICO CONCLUÍDO - SEM PROBLEMAS

Olá ${nome || 'Cliente'},

Realizamos um diagnóstico completo do seu acesso e está tudo funcionando perfeitamente!

📋 SUAS CREDENCIAIS:
• Email: ${email}
• Senha: parceriadesucesso

🔑 COMO ACESSAR:
1. Acesse: [LINK DO SISTEMA]
2. Clique em "Entrar"
3. Digite seu email e senha
4. Clique em "Entrar"

✅ STATUS: Tudo funcionando normalmente
⏰ Testado em: ${new Date().toLocaleString('pt-BR')}

Se tiver qualquer dúvida, estamos aqui para ajudar!

Atenciosamente,
Equipe Suporte`
  }

  const generateIssueMessage = (email: string, issues: DiagnosticIssue[], nome?: string) => {
    const criticalIssues = issues.filter(i => i.severity === 'critical')
    
    return `🔧 DIAGNÓSTICO CONCLUÍDO - PROBLEMAS IDENTIFICADOS

Olá ${nome || 'Cliente'},

Identificamos alguns problemas com seu acesso que precisam ser corrigidos:

❌ PROBLEMAS ENCONTRADOS:
${criticalIssues.map(issue => `• ${issue.description}`).join('\n')}

🔧 CORREÇÕES NECESSÁRIAS:
${criticalIssues.map(issue => `• ${issue.solution}`).join('\n')}

📞 PRÓXIMOS PASSOS:
Nossa equipe técnica irá aplicar as correções necessárias. Você receberá uma nova mensagem quando tudo estiver funcionando.

📋 SEUS DADOS:
• Email: ${email}
• Senha será: parceriadesucesso

⏰ Diagnóstico realizado em: ${new Date().toLocaleString('pt-BR')}

Atenciosamente,
Equipe Suporte`
  }

  const generateCorrectionMessage = (email: string, corrections: DiagnosticCorrection[], nome?: string) => {
    const successful = corrections.filter(c => c.status === 'success')
    const failed = corrections.filter(c => c.status === 'failed')
    
    return `✅ CORREÇÕES APLICADAS COM SUCESSO

Olá ${nome || 'Cliente'},

Aplicamos as correções no seu acesso! Agora você já pode entrar no sistema.

✅ CORREÇÕES REALIZADAS:
${successful.map(c => `• ${c.action} - ${c.message}`).join('\n')}

${failed.length > 0 ? `
⚠️ PENDÊNCIAS (se houver):
${failed.map(c => `• ${c.action} - ${c.message}`).join('\n')}
` : ''}

🔑 SUAS CREDENCIAIS ATUALIZADAS:
• Email: ${email}  
• Senha: parceriadesucesso

🚀 COMO ACESSAR AGORA:
1. Acesse: [LINK DO SISTEMA]
2. Clique em "Entrar"  
3. Digite seu email e senha
4. Clique em "Entrar"

✅ STATUS: Acesso liberado e funcionando
⏰ Corrigido em: ${new Date().toLocaleString('pt-BR')}

Seu acesso está 100% funcionando! Se tiver qualquer dúvida, estamos aqui.

Atenciosamente,
Equipe Suporte`
  }

  return {
    loading,
    fixing,
    progress,
    result,
    runCompleteDiagnostic,
    applyCorrections
  }
}

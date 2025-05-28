import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { DiagnosticResult, DiagnosticIssue, DiagnosticCorrection, DiagnosticProgress } from '@/components/AuthDiagnostic/DiagnosticTypes'

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
    console.log('🔧 [AdvancedDiagnostic] Aplicando correções para:', diagnosticResult.email)

    try {
      // Preparar lista de correções que podem ser aplicadas automaticamente
      const correctableIssues = diagnosticResult.issues.filter(issue => 
        ['missing_user', 'wrong_password', 'unconfirmed_email'].includes(issue.type)
      )

      if (correctableIssues.length === 0) {
        toast({
          title: "Nenhuma Correção Disponível",
          description: "Não há correções automáticas disponíveis para este caso",
          variant: "destructive"
        })
        return
      }

      // Chamar a Edge Function para aplicar as correções
      const { data: fixResult, error: fixError } = await supabase.functions.invoke('fix-client-auth', {
        body: {
          email: diagnosticResult.email,
          corrections: correctableIssues.map(issue => ({
            type: issue.type,
            action: issue.solution
          }))
        }
      })

      if (fixError) {
        console.error('❌ [AdvancedDiagnostic] Erro na Edge Function:', fixError)
        throw new Error(`Erro ao aplicar correções: ${fixError.message}`)
      }

      console.log('✅ [AdvancedDiagnostic] Resultado das correções:', fixResult)

      // Atualizar resultado com correções aplicadas
      const updatedResult = {
        ...diagnosticResult,
        corrections: fixResult.corrections || [],
        clientMessage: generateCorrectionMessage(
          diagnosticResult.email, 
          fixResult.corrections || [], 
          diagnosticResult.clienteData?.nome_cliente,
          fixResult.warnings
        )
      }
      
      setResult(updatedResult)

      // Mostrar resultado com base no sucesso e warnings
      if (fixResult.success && fixResult.successfulCorrections > 0) {
        let description = `${fixResult.successfulCorrections} de ${fixResult.totalCorrections} correções aplicadas com sucesso`
        
        if (fixResult.warnings && fixResult.warnings.length > 0) {
          description += `. Avisos: ${fixResult.warnings.length}`
        }

        toast({
          title: "Correções Aplicadas",
          description,
          variant: fixResult.warnings && fixResult.warnings.length > 0 ? "default" : "default"
        })
      } else {
        let description = `${fixResult.successfulCorrections || 0} de ${fixResult.totalCorrections || 0} correções aplicadas`
        
        if (fixResult.warnings && fixResult.warnings.length > 0) {
          description += `. Alguns avisos foram encontrados - verifique o resultado`
        }

        toast({
          title: fixResult.successfulCorrections > 0 ? "Correções Parciais" : "Correções Falharam",
          description,
          variant: fixResult.successfulCorrections > 0 ? "default" : "destructive"
        })
      }

    } catch (error) {
      console.error('💥 [AdvancedDiagnostic] Erro nas correções:', error)
      toast({
        title: "Erro nas Correções",
        description: error instanceof Error ? error.message : "Erro inesperado durante as correções",
        variant: "destructive"
      })
    } finally {
      setFixing(false)
    }
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

  const generateCorrectionMessage = (email: string, corrections: DiagnosticCorrection[], nome?: string, warnings?: string[]) => {
    const successful = corrections.filter(c => c.status === 'success')
    const failed = corrections.filter(c => c.status === 'failed')
    
    let message = `✅ CORREÇÕES APLICADAS

Olá ${nome || 'Cliente'},

Aplicamos as correções no seu acesso! `

    if (successful.length > 0) {
      message += `Agora você já pode entrar no sistema.

✅ CORREÇÕES REALIZADAS:
${successful.map(c => `• ${c.action} - ${c.message}`).join('\n')}`
    }

    if (failed.length > 0) {
      message += `

⚠️ CORREÇÕES QUE FALHARAM:
${failed.map(c => `• ${c.action} - ${c.message}`).join('\n')}`
    }

    if (warnings && warnings.length > 0) {
      message += `

ℹ️ AVISOS:
${warnings.map(w => `• ${w}`).join('\n')}`
    }

    message += `

🔑 SUAS CREDENCIAIS ATUALIZADAS:
• Email: ${email}  
• Senha: parceriadesucesso

🚀 COMO ACESSAR AGORA:
1. Acesse: [LINK DO SISTEMA]
2. Clique em "Entrar"  
3. Digite seu email e senha
4. Clique em "Entrar"

✅ STATUS: ${successful.length > 0 ? 'Acesso liberado e funcionando' : 'Verificar pendências acima'}
⏰ Processado em: ${new Date().toLocaleString('pt-BR')}

${successful.length > 0 ? 'Seu acesso está funcionando! Se tiver qualquer dúvida, estamos aqui.' : 'Entre em contato caso precise de ajuda adicional.'}

Atenciosamente,
Equipe Suporte`

    return message
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


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
    console.log('🔍 [AdvancedDiagnostic] === DIAGNÓSTICO ROBUSTO V6 ===')
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
          severity: 'warning',
          description: 'Cliente não encontrado na base de dados',
          solution: 'Verificar se email está correto ou cadastrar cliente'
        })
        console.log('⚠️ [AdvancedDiagnostic] Cliente não encontrado na base')
      }

      // 2. Verificar usuário no Auth com detecção robusta
      updateProgress("Verificando usuário no Auth", 40, "Consulta robusta no sistema de autenticação...")
      
      let authUserExists = false
      let authUserData = null
      
      try {
        const { data: checkResult, error: checkError } = await supabase.functions.invoke('fix-client-auth', {
          body: {
            email: normalizedEmail,
            checkOnly: true
          }
        })

        if (checkError) {
          console.error('❌ [AdvancedDiagnostic] Erro ao verificar usuário:', checkError)
          throw new Error(`Erro ao verificar usuário: ${checkError.message}`)
        }

        authUserExists = checkResult.userExists || false
        authUserData = checkResult.userData || null
        
        console.log('🔍 [AdvancedDiagnostic] Usuário existe no Auth:', authUserExists ? 'SIM' : 'NÃO')
        
        if (authUserExists) {
          diagnosticResult.userExistsInAuth = true
          diagnosticResult.emailConfirmed = authUserData?.email_confirmed_at !== null
          console.log('📧 [AdvancedDiagnostic] Email confirmado:', diagnosticResult.emailConfirmed ? 'SIM' : 'NÃO')
        }
      } catch (error) {
        console.error('❌ [AdvancedDiagnostic] Erro ao verificar usuário:', error)
        diagnosticResult.issues.push({
          type: 'unknown',
          severity: 'critical',
          description: 'Erro ao verificar usuário no sistema',
          solution: 'Tentar novamente ou contatar suporte'
        })
      }

      // 3. Determinar se precisa de correções
      updateProgress("Analisando problemas", 60, "Identificando correções necessárias...")
      
      if (!authUserExists) {
        diagnosticResult.issues.push({
          type: 'missing_user',
          severity: 'critical',
          description: 'Usuário não existe no sistema de autenticação',
          solution: 'Criar usuário com senha "parceriadesucesso"'
        })
      } else {
        // Usuário existe - testar login
        updateProgress("Testando credenciais", 70, "Verificando se consegue fazer login...")
        
        try {
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: 'parceriadesucesso'
          })
          
          if (!loginErr && loginData.user) {
            diagnosticResult.canLogin = true
            diagnosticResult.emailConfirmed = loginData.user.email_confirmed_at !== null
            
            // Fazer logout imediato
            await supabase.auth.signOut()
            
            console.log('✅ [AdvancedDiagnostic] Login bem-sucedido')
          } else {
            console.log('❌ [AdvancedDiagnostic] Erro no login:', loginErr?.message)
            
            diagnosticResult.issues.push({
              type: 'wrong_password',
              severity: 'critical',
              description: 'Usuário existe mas credenciais precisam ser resetadas',
              solution: 'Resetar senha para "parceriadesucesso" e confirmar email'
            })
          }
        } catch (error) {
          console.error('❌ [AdvancedDiagnostic] Erro no teste de login:', error)
          diagnosticResult.issues.push({
            type: 'wrong_password',
            severity: 'critical',
            description: 'Erro no teste de login - reset necessário',
            solution: 'Resetar senha para "parceriadesucesso"'
          })
        }
      }

      // 4. Gerar mensagem
      updateProgress("Gerando relatório", 90, "Preparando correções...")
      
      const criticalIssues = diagnosticResult.issues.filter(i => i.severity === 'critical')
      
      if (criticalIssues.length === 0) {
        diagnosticResult.clientMessage = generateSuccessMessage(normalizedEmail, diagnosticResult.clienteData?.nome_cliente)
      } else {
        diagnosticResult.clientMessage = generateIssueMessage(normalizedEmail, criticalIssues, diagnosticResult.clienteData?.nome_cliente)
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
    console.log('🔧 [AdvancedDiagnostic] === APLICANDO CORREÇÕES ROBUSTAS V6 ===')
    console.log('📧 [AdvancedDiagnostic] Email:', diagnosticResult.email)

    try {
      const criticalIssues = diagnosticResult.issues.filter(issue => 
        issue.severity === 'critical'
      )

      console.log('🔧 [AdvancedDiagnostic] Issues críticos encontrados:', criticalIssues.length)

      // Chamar Edge Function robusta
      console.log('🔧 [AdvancedDiagnostic] Chamando Edge Function V6 robusta...')

      const { data: fixResult, error: fixError } = await supabase.functions.invoke('fix-client-auth', {
        body: {
          email: diagnosticResult.email,
          corrections: criticalIssues.map(issue => ({
            type: issue.type,
            action: issue.solution
          }))
        }
      })

      if (fixError) {
        console.error('❌ [AdvancedDiagnostic] Erro na Edge Function:', fixError)
        throw new Error(`Erro ao aplicar correções: ${fixError.message}`)
      }

      console.log('✅ [AdvancedDiagnostic] Resultado das correções V6:', fixResult)

      // Atualizar resultado com correções aplicadas
      const updatedResult = {
        ...diagnosticResult,
        corrections: fixResult.corrections || [],
        canLogin: fixResult.loginValidated || false,
        clientMessage: fixResult.clientMessage || generateCorrectionMessage(
          diagnosticResult.email, 
          fixResult.corrections || [], 
          diagnosticResult.clienteData?.nome_cliente,
          fixResult.warnings
        )
      }
      
      setResult(updatedResult)

      // FEEDBACK ROBUSTA baseado no resultado real
      console.log('📊 [AdvancedDiagnostic] Analisando resultado robusto:', {
        success: fixResult.success,
        successfulCorrections: fixResult.successfulCorrections,
        totalCorrections: fixResult.totalCorrections,
        loginValidated: fixResult.loginValidated
      })

      if (fixResult.success && fixResult.successfulCorrections > 0) {
        if (fixResult.loginValidated) {
          toast({
            title: "🎯 Correção 100% Bem-Sucedida!",
            description: `${fixResult.successfulCorrections} de ${fixResult.totalCorrections || fixResult.successfulCorrections} correções aplicadas - Login validado!`,
            variant: "default"
          })
        } else {
          toast({
            title: "✅ Correções Aplicadas!",
            description: `${fixResult.successfulCorrections} de ${fixResult.totalCorrections || fixResult.successfulCorrections} correções aplicadas com sucesso`,
            variant: "default"
          })
        }
      } else {
        toast({
          title: "⚠️ Problema na Correção",
          description: fixResult.warnings ? fixResult.warnings.join(', ') : "Nenhuma correção foi aplicada",
          variant: "destructive"
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
1. Acesse: https://login.trafegoporcents.com
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
1. Acesse: https://login.trafegoporcents.com
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

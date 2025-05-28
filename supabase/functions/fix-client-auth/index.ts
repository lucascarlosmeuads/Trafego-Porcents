
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FixRequest {
  email: string
  corrections?: Array<{
    type: 'missing_user' | 'wrong_password' | 'unconfirmed_email'
    action: string
  }>
  checkOnly?: boolean
}

interface FixResult {
  email: string
  userExists?: boolean
  userData?: any
  corrections?: Array<{
    action: string
    status: 'success' | 'failed'
    message: string
    timestamp: string
  }>
  success: boolean
  totalCorrections?: number
  successfulCorrections?: number
  warnings?: string[]
  loginValidated?: boolean
  clientMessage?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 [FixClientAuth] === OPERAÇÃO INICIADA V4 ===')

    const { email, corrections, checkOnly }: FixRequest = await req.json()
    
    if (!email) {
      throw new Error('Email é obrigatório')
    }

    // Criar cliente Supabase com service_role para privilégios administrativos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const normalizedEmail = email.toLowerCase().trim()
    console.log('📧 [FixClientAuth] Processando email:', normalizedEmail)

    // 1. DETECÇÃO MELHORADA: Usar getUserByEmail primeiro, depois listUsers como fallback
    console.log('🔍 [FixClientAuth] === DETECÇÃO DUPLA DE USUÁRIO ===')
    
    let existingUser = null
    let userExists = false
    let detectionMethod = ''
    
    try {
      // MÉTODO 1: getUserByEmail (mais confiável para usuários existentes)
      console.log('🔍 [FixClientAuth] Tentando getUserByEmail...')
      
      const { data: userByEmail, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(normalizedEmail)
      
      if (!getUserError && userByEmail.user) {
        existingUser = userByEmail.user
        userExists = true
        detectionMethod = 'getUserByEmail'
        console.log('✅ [FixClientAuth] Usuário encontrado via getUserByEmail:', existingUser.id)
      } else {
        console.log('⚠️ [FixClientAuth] getUserByEmail não encontrou:', getUserError?.message)
        
        // MÉTODO 2: listUsers como fallback
        console.log('🔍 [FixClientAuth] Fallback para listUsers...')
        
        const { data: usersResponse, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (usersError) {
          console.error('❌ [FixClientAuth] Erro ao listar usuários:', usersError)
          throw new Error(`Erro ao verificar usuário: ${usersError.message}`)
        }
        
        existingUser = usersResponse.users.find(u => u.email?.toLowerCase() === normalizedEmail)
        userExists = !!existingUser
        detectionMethod = 'listUsers'
        
        if (userExists) {
          console.log('✅ [FixClientAuth] Usuário encontrado via listUsers:', existingUser.id)
        } else {
          console.log('❌ [FixClientAuth] Usuário não encontrado em nenhum método')
        }
      }
      
    } catch (error) {
      console.error('❌ [FixClientAuth] Erro crítico na verificação:', error)
      throw error
    }

    console.log(`🔍 [FixClientAuth] Resultado da detecção: ${userExists ? 'EXISTE' : 'NÃO EXISTE'} (método: ${detectionMethod})`)

    // 2. Verificar cliente na base de dados (não-bloqueante)
    let clienteExists = false
    let clienteData = null
    const warnings: string[] = []
    
    try {
      const { data: clientes, error: clienteError } = await supabaseAdmin
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente')
        .eq('email_cliente', normalizedEmail)

      if (clienteError) {
        console.error('⚠️ [FixClientAuth] Erro ao buscar cliente:', clienteError)
        warnings.push(`Erro ao verificar cliente na base: ${clienteError.message}`)
      } else if (clientes && clientes.length > 0) {
        clienteExists = true
        clienteData = clientes[0]
        console.log('✅ [FixClientAuth] Cliente encontrado:', clienteData.nome_cliente)
        
        if (clientes.length > 1) {
          warnings.push(`Encontrados ${clientes.length} registros duplicados - usando o primeiro`)
          console.log(`⚠️ [FixClientAuth] ${clientes.length} registros duplicados encontrados`)
        }
      } else {
        console.log('⚠️ [FixClientAuth] Cliente não encontrado na base de dados')
        warnings.push('Cliente não encontrado na base de dados')
      }
    } catch (error) {
      console.error('⚠️ [FixClientAuth] Erro inesperado ao verificar cliente:', error)
      warnings.push(`Erro inesperado ao verificar cliente: ${error.message}`)
    }

    // Se for apenas verificação, retornar resultado
    if (checkOnly) {
      console.log('🔍 [FixClientAuth] Modo verificação - retornando resultado')
      return new Response(
        JSON.stringify({
          email: normalizedEmail,
          userExists,
          userData: existingUser,
          success: true,
          warnings: warnings.length > 0 ? warnings : undefined
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // 3. LÓGICA INTELIGENTE: Priorizar reset de senha para resolver conflitos
    console.log('🔧 [FixClientAuth] === APLICANDO CORREÇÕES INTELIGENTES V4 ===')

    const appliedCorrections: Array<{
      action: string
      status: 'success' | 'failed'
      message: string
      timestamp: string
    }> = []

    let correctionSuccessful = false

    // ESTRATÉGIA INTELIGENTE: Se há algum indício de que o usuário existe, tentar reset primeiro
    if (userExists || detectionMethod === 'getUserByEmail') {
      console.log('🔑 [FixClientAuth] Usuário existe - aplicando reset de senha...')
      
      try {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { 
            password: 'parceriadesucesso',
            email_confirm: true
          }
        )

        if (updateError) {
          throw updateError
        }

        appliedCorrections.push({
          action: 'Reset de senha e confirmação de email',
          status: 'success',
          message: 'Senha resetada para "parceriadesucesso" e email confirmado',
          timestamp: new Date().toISOString()
        })
        
        correctionSuccessful = true
        console.log('✅ [FixClientAuth] Reset de senha aplicado com sucesso')
        
      } catch (error: any) {
        console.error('❌ [FixClientAuth] Erro no reset de senha:', error)
        appliedCorrections.push({
          action: 'Reset de senha',
          status: 'failed',
          message: `Erro no reset: ${error.message}`,
          timestamp: new Date().toISOString()
        })
      }
    } else {
      // CRIAÇÃO DE USUÁRIO como segunda opção
      console.log('➕ [FixClientAuth] Usuário não existe - criando novo usuário...')
      
      try {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: 'parceriadesucesso',
          email_confirm: true,
          user_metadata: {
            user_type: 'cliente',
            created_by_fix_function: true,
            created_at: new Date().toISOString(),
            client_exists_in_db: clienteExists,
            nome_cliente: clienteData?.nome_cliente || 'Cliente'
          }
        })

        if (createError) {
          if (createError.message?.includes('already been registered')) {
            console.log('🔄 [FixClientAuth] Conversão: usuário já existe, tentando reset...')
            
            // FALLBACK AUTOMÁTICO: Buscar usuário novamente e resetar senha
            const { data: usersRetry } = await supabaseAdmin.auth.admin.listUsers()
            const foundUser = usersRetry.users.find(u => u.email?.toLowerCase() === normalizedEmail)
            
            if (foundUser) {
              const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                foundUser.id,
                { 
                  password: 'parceriadesucesso',
                  email_confirm: true
                }
              )

              if (updateError) {
                throw updateError
              }

              appliedCorrections.push({
                action: 'Criar usuário (convertido automaticamente para reset)',
                status: 'success',
                message: 'Usuário já existia - senha resetada automaticamente',
                timestamp: new Date().toISOString()
              })
              
              existingUser = foundUser
              correctionSuccessful = true
              console.log('✅ [FixClientAuth] Fallback automático bem-sucedido')
            } else {
              throw createError
            }
          } else {
            throw createError
          }
        } else {
          appliedCorrections.push({
            action: 'Criar usuário no sistema de autenticação',
            status: 'success',
            message: 'Usuário criado com sucesso',
            timestamp: new Date().toISOString()
          })
          
          console.log('✅ [FixClientAuth] Usuário criado:', newUser.user?.id)
          existingUser = newUser.user
          correctionSuccessful = true
        }
      } catch (error: any) {
        console.error('❌ [FixClientAuth] Erro na criação/fallback:', error)
        appliedCorrections.push({
          action: 'Criar usuário no sistema de autenticação',
          status: 'failed',
          message: `Erro: ${error.message}`,
          timestamp: new Date().toISOString()
        })
      }
    }

    // 4. VALIDAÇÃO REAL PÓS-CORREÇÃO com login de teste
    let loginValidated = false
    console.log('🧪 [FixClientAuth] === VALIDAÇÃO PÓS-CORREÇÃO ===')
    
    if (correctionSuccessful) {
      console.log('🔐 [FixClientAuth] Testando login com credenciais...')
      
      try {
        // Criar cliente normal para teste de login
        const supabaseTest = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        const { data: loginData, error: loginError } = await supabaseTest.auth.signInWithPassword({
          email: normalizedEmail,
          password: 'parceriadesucesso'
        })

        if (!loginError && loginData.user) {
          loginValidated = true
          console.log('✅ [FixClientAuth] Login validado com sucesso!')
          
          // Fazer logout imediato do teste
          await supabaseTest.auth.signOut()
          
          // Atualizar o status da correção para refletir o sucesso completo
          if (appliedCorrections.length > 0) {
            appliedCorrections[appliedCorrections.length - 1].message += ' - Login validado'
          }
        } else {
          console.log('⚠️ [FixClientAuth] Falha na validação do login:', loginError?.message)
          warnings.push(`Login de teste falhou: ${loginError?.message}`)
        }
      } catch (error) {
        console.error('❌ [FixClientAuth] Erro no teste de login:', error)
        warnings.push(`Erro no teste de login: ${error.message}`)
      }
    }

    // 5. Log da operação no banco
    try {
      await supabaseAdmin
        .from('client_user_creation_log')
        .insert({
          email_cliente: normalizedEmail,
          operation_type: 'intelligent_corrections_v4',
          result_message: `Método detecção: ${detectionMethod}. Correção aplicada: ${correctionSuccessful ? 'Sim' : 'Não'}. Login validado: ${loginValidated ? 'Sim' : 'Não'}. Cliente na base: ${clienteExists ? 'Sim' : 'Não'}. Duplicatas: ${warnings.some(w => w.includes('duplicados')) ? 'Sim' : 'Não'}`
        })
    } catch (logError) {
      console.error('⚠️ [FixClientAuth] Erro ao salvar log (não crítico):', logError)
      warnings.push('Erro ao salvar log da operação')
    }

    // 6. Gerar mensagem final otimizada
    const clientMessage = generateClientMessage(
      normalizedEmail, 
      clienteData?.nome_cliente, 
      appliedCorrections, 
      loginValidated, 
      warnings
    )

    const successfulCorrections = appliedCorrections.filter(c => c.status === 'success').length
    
    const result: FixResult = {
      email: normalizedEmail,
      corrections: appliedCorrections,
      success: correctionSuccessful,
      totalCorrections: Math.max(appliedCorrections.length, 1),
      successfulCorrections,
      loginValidated,
      clientMessage,
      warnings: warnings.length > 0 ? warnings : undefined
    }

    console.log('📝 [FixClientAuth] === RESULTADO FINAL V4 ===')
    console.log('✅ Correções aplicadas:', successfulCorrections)
    console.log('🔐 Login validado:', loginValidated)
    console.log('📊 Sucesso geral:', correctionSuccessful)
    console.log('🎯 Método de detecção usado:', detectionMethod)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 [FixClientAuth] Erro fatal:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        corrections: [],
        totalCorrections: 0,
        successfulCorrections: 0,
        loginValidated: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})

function generateClientMessage(
  email: string, 
  nomeCliente: string | undefined, 
  corrections: Array<{action: string, status: string, message: string}>, 
  loginValidated: boolean,
  warnings?: string[]
): string {
  const successful = corrections.filter(c => c.status === 'success')
  
  let message = `✅ ACESSO LIBERADO E FUNCIONANDO

Olá ${nomeCliente || 'Cliente'},

${loginValidated ? 'Seu acesso foi corrigido e testado com sucesso! Você já pode entrar no sistema.' : 'Aplicamos as correções no seu acesso.'}`

  if (successful.length > 0) {
    message += `

🔧 CORREÇÕES REALIZADAS:
${successful.map(c => `• ${c.message}`).join('\n')}`
  }

  if (warnings && warnings.length > 0) {
    message += `

ℹ️ INFORMAÇÕES TÉCNICAS:
${warnings.map(w => `• ${w}`).join('\n')}`
  }

  message += `

🔑 SUAS CREDENCIAIS DE ACESSO:
• Email: ${email}
• Senha: parceriadesucesso

🚀 COMO ACESSAR O SISTEMA:
1. Acesse: https://login.trafegoporcents.com
2. Clique em "Entrar"
3. Digite seu email e senha exatamente como mostrado acima
4. Clique em "Entrar"

${loginValidated ? '✅ STATUS: Acesso 100% validado e funcionando' : '⚠️ STATUS: Correções aplicadas, aguardando teste'}
⏰ Processado em: ${new Date().toLocaleString('pt-BR')}

${loginValidated ? 'Seu acesso está funcionando perfeitamente! Se tiver qualquer dúvida, estamos aqui.' : 'Teste o acesso e nos informe se houver algum problema.'}

Atenciosamente,
Equipe Suporte Técnico`

  return message
}

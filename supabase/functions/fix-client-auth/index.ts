

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
    console.log('🔧 [FixClientAuth] === CORREÇÃO ROBUSTA V6 ===')

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

    // 1. DETECÇÃO ROBUSTA MÚLTIPLA
    console.log('🔍 [FixClientAuth] === DETECÇÃO ROBUSTA MÚLTIPLA ===')
    
    let existingUser = null
    let userExists = false
    let detectionMethod = 'none'
    
    // Método 1: getUserByEmail (mais direto)
    try {
      console.log('🔍 [FixClientAuth] Tentativa 1: getUserByEmail...')
      const { data: userByEmail, error: emailError } = await supabaseAdmin.auth.admin.getUserByEmail(normalizedEmail)
      
      if (!emailError && userByEmail?.user) {
        existingUser = userByEmail.user
        userExists = true
        detectionMethod = 'getUserByEmail'
        console.log('✅ [FixClientAuth] Usuário encontrado via getUserByEmail:', existingUser.id)
      } else {
        console.log('⚠️ [FixClientAuth] getUserByEmail não encontrou:', emailError?.message || 'usuário não existe')
      }
    } catch (error) {
      console.error('❌ [FixClientAuth] Erro no getUserByEmail:', error)
    }

    // Método 2: listUsers (fallback)
    if (!userExists) {
      try {
        console.log('🔍 [FixClientAuth] Tentativa 2: listUsers...')
        const { data: usersResponse, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (usersError) {
          console.error('❌ [FixClientAuth] Erro ao listar usuários:', usersError)
        } else {
          const foundUser = usersResponse.users.find(u => u.email?.toLowerCase() === normalizedEmail)
          if (foundUser) {
            existingUser = foundUser
            userExists = true
            detectionMethod = 'listUsers'
            console.log('✅ [FixClientAuth] Usuário encontrado via listUsers:', foundUser.id)
          } else {
            console.log('⚠️ [FixClientAuth] listUsers não encontrou usuário')
          }
        }
      } catch (error) {
        console.error('❌ [FixClientAuth] Erro no listUsers:', error)
      }
    }

    console.log(`🎯 [FixClientAuth] Resultado da detecção: ${userExists ? 'ENCONTRADO' : 'NÃO ENCONTRADO'} via ${detectionMethod}`)

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

    // 3. ESTRATÉGIA DE CORREÇÃO ROBUSTA
    console.log('🔧 [FixClientAuth] === ESTRATÉGIA DE CORREÇÃO ROBUSTA ===')

    const appliedCorrections: Array<{
      action: string
      status: 'success' | 'failed'
      message: string
      timestamp: string
    }> = []

    let operationSuccessful = false
    let finalUserId = null

    // ESTRATÉGIA: Reset se existe, criação com fallback se não existe
    if (userExists && existingUser) {
      console.log('🔑 [FixClientAuth] Usuário existe - aplicando reset de senha...')
      
      try {
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { 
            password: 'parceriadesucesso',
            email_confirm: true
          }
        )

        if (updateError) {
          console.error('❌ [FixClientAuth] Erro no reset:', updateError)
          throw updateError
        }

        appliedCorrections.push({
          action: 'Reset de senha e confirmação de email',
          status: 'success',
          message: 'Senha resetada para "parceriadesucesso" e email confirmado',
          timestamp: new Date().toISOString()
        })
        
        operationSuccessful = true
        finalUserId = existingUser.id
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
          console.error('❌ [FixClientAuth] Erro na criação:', createError)
          
          // FALLBACK AUTOMÁTICO para "already registered"
          if (createError.message?.includes('already been registered') || createError.message?.includes('User already registered')) {
            console.log('🔄 [FixClientAuth] Usuário já existe (erro de criação) - executando detecção e reset...')
            
            // Nova detecção após erro de criação
            let fallbackUser = null
            
            // Tentar getUserByEmail novamente
            try {
              const { data: retryUserByEmail } = await supabaseAdmin.auth.admin.getUserByEmail(normalizedEmail)
              if (retryUserByEmail?.user) {
                fallbackUser = retryUserByEmail.user
              }
            } catch (e) {
              console.log('⚠️ [FixClientAuth] Retry getUserByEmail falhou:', e)
            }
            
            // Se ainda não encontrou, tentar listUsers
            if (!fallbackUser) {
              try {
                const { data: retryUsers } = await supabaseAdmin.auth.admin.listUsers()
                fallbackUser = retryUsers.users.find(u => u.email?.toLowerCase() === normalizedEmail)
              } catch (e) {
                console.log('⚠️ [FixClientAuth] Retry listUsers falhou:', e)
              }
            }
            
            if (fallbackUser) {
              console.log('✅ [FixClientAuth] Usuário encontrado no fallback - aplicando reset...')
              
              const { error: fallbackUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
                fallbackUser.id,
                { 
                  password: 'parceriadesucesso',
                  email_confirm: true
                }
              )

              if (fallbackUpdateError) {
                throw fallbackUpdateError
              }

              appliedCorrections.push({
                action: 'Criar usuário (convertido para reset automático)',
                status: 'success',
                message: 'Usuário já existia - senha resetada automaticamente via fallback',
                timestamp: new Date().toISOString()
              })
              
              operationSuccessful = true
              finalUserId = fallbackUser.id
              console.log('✅ [FixClientAuth] Fallback automático bem-sucedido')
            } else {
              throw new Error('Usuário não pôde ser encontrado após erro de criação')
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
          operationSuccessful = true
          finalUserId = newUser.user?.id
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

    // 4. VALIDAÇÃO DE LOGIN OBRIGATÓRIA
    let loginValidated = false
    console.log('🧪 [FixClientAuth] === VALIDAÇÃO DE LOGIN OBRIGATÓRIA ===')
    
    if (operationSuccessful) {
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

    // 5. FORÇAR SUCESSO QUANDO OPERAÇÃO É REALIZADA
    const successfulCorrections = appliedCorrections.filter(c => c.status === 'success').length
    const finalSuccess = operationSuccessful && successfulCorrections > 0

    console.log('📊 [FixClientAuth] === RESULTADO FINAL ===')
    console.log('✅ Operação realizada:', operationSuccessful)
    console.log('✅ Correções bem-sucedidas:', successfulCorrections)
    console.log('🔐 Login validado:', loginValidated)
    console.log('🎯 Sucesso final:', finalSuccess)

    // 6. Log da operação no banco
    try {
      await supabaseAdmin
        .from('client_user_creation_log')
        .insert({
          email_cliente: normalizedEmail,
          operation_type: 'robust_corrections_v6',
          result_message: `Detecção: ${detectionMethod}. Usuário existia: ${userExists ? 'Sim' : 'Não'}. Operação realizada: ${operationSuccessful ? 'Sim' : 'Não'}. Correções aplicadas: ${successfulCorrections}. Login validado: ${loginValidated ? 'Sim' : 'Não'}. Cliente na base: ${clienteExists ? 'Sim' : 'Não'}.`
        })
    } catch (logError) {
      console.error('⚠️ [FixClientAuth] Erro ao salvar log (não crítico):', logError)
      warnings.push('Erro ao salvar log da operação')
    }

    // 7. Gerar mensagem final
    const clientMessage = generateClientMessage(
      normalizedEmail, 
      clienteData?.nome_cliente, 
      appliedCorrections, 
      loginValidated, 
      warnings
    )
    
    const result: FixResult = {
      email: normalizedEmail,
      corrections: appliedCorrections,
      success: finalSuccess,
      totalCorrections: Math.max(appliedCorrections.length, 1),
      successfulCorrections: Math.max(successfulCorrections, finalSuccess ? 1 : 0),
      loginValidated,
      clientMessage,
      warnings: warnings.length > 0 ? warnings : undefined
    }

    console.log('📝 [FixClientAuth] Resultado enviado para frontend:', {
      success: result.success,
      successfulCorrections: result.successfulCorrections,
      totalCorrections: result.totalCorrections,
      loginValidated: result.loginValidated
    })

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
  
  let message = `✅ ACESSO CORRIGIDO E FUNCIONANDO

Olá ${nomeCliente || 'Cliente'},

${loginValidated ? 'Seu acesso foi corrigido e testado com sucesso! Você já pode entrar no sistema.' : 'Aplicamos as correções no seu acesso.'}`

  if (successful.length > 0) {
    message += `

🔧 CORREÇÕES REALIZADAS:
${successful.map(c => `• ${c.message}`).join('\n')}`
  }

  if (warnings && warnings.length > 0) {
    message += `

ℹ️ INFORMAÇÕES ADICIONAIS:
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

${loginValidated ? '✅ STATUS: Acesso 100% validado e funcionando' : '⚠️ STATUS: Correções aplicadas, teste o acesso'}
⏰ Processado em: ${new Date().toLocaleString('pt-BR')}

${loginValidated ? 'Seu acesso está funcionando perfeitamente! Se tiver qualquer dúvida, estamos aqui.' : 'Teste o acesso e nos informe se houver algum problema.'}

Atenciosamente,
Equipe Suporte Técnico`

  return message
}

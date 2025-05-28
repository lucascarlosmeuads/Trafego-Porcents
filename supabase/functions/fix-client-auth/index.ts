
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
    console.log('🔧 [FixClientAuth] === OPERAÇÃO INICIADA ===')

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

    // 1. ETAPA CRÍTICA: Verificar usuário usando listUsers (método confiável)
    console.log('🔍 [FixClientAuth] Verificando usuário com listUsers...')
    
    let existingUser = null
    let userExists = false
    
    try {
      // Usar listUsers que sabemos que funciona
      const { data: usersResponse, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (usersError) {
        console.error('❌ [FixClientAuth] Erro ao listar usuários:', usersError)
        throw new Error(`Erro ao verificar usuário: ${usersError.message}`)
      }
      
      existingUser = usersResponse.users.find(u => u.email?.toLowerCase() === normalizedEmail)
      userExists = !!existingUser
      
      console.log('🔍 [FixClientAuth] Resultado da verificação:', {
        userExists,
        userId: existingUser?.id,
        emailConfirmed: existingUser?.email_confirmed_at !== null
      })
      
    } catch (error) {
      console.error('❌ [FixClientAuth] Erro crítico na verificação:', error)
      throw error
    }

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
        clienteData = clientes[0] // Usar o primeiro registro encontrado
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

    // 3. ETAPA CRÍTICA: Aplicar correções inteligentes SEMPRE QUE NECESSÁRIO
    console.log('🔧 [FixClientAuth] === APLICANDO CORREÇÕES AUTOMÁTICAS ===')

    const appliedCorrections: Array<{
      action: string
      status: 'success' | 'failed'
      message: string
      timestamp: string
    }> = []

    // LÓGICA INTELIGENTE: Se usuário não existe, sempre tentar criar
    if (!userExists) {
      console.log('➕ [FixClientAuth] Usuário não existe - criando automaticamente...')
      
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
            console.log('🔄 [FixClientAuth] Usuário já existe após verificação - resetando senha...')
            
            // Buscar usuário novamente
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
                action: 'Criar usuário (convertido para reset de senha)',
                status: 'success',
                message: 'Usuário já existia, senha resetada para "parceriadesucesso"',
                timestamp: new Date().toISOString()
              })
              
              existingUser = foundUser // Atualizar referência
              userExists = true
              console.log('✅ [FixClientAuth] Conversão bem-sucedida - senha resetada')
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
            message: 'Usuário criado com sucesso no sistema de autenticação',
            timestamp: new Date().toISOString()
          })
          
          console.log('✅ [FixClientAuth] Usuário criado:', newUser.user?.id)
          existingUser = newUser.user // Atualizar referência
          userExists = true
        }
      } catch (error: any) {
        console.error('❌ [FixClientAuth] Erro ao criar usuário:', error)
        appliedCorrections.push({
          action: 'Criar usuário no sistema de autenticação',
          status: 'failed',
          message: `Erro ao criar usuário: ${error.message}`,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Processar correções adicionais se fornecidas
    if (corrections && corrections.length > 0) {
      console.log('🔧 [FixClientAuth] Processando correções adicionais:', corrections.length)
      
      for (const correction of corrections) {
        console.log(`🔧 [FixClientAuth] Aplicando: ${correction.type}`)
        
        try {
          switch (correction.type) {
            case 'wrong_password':
              if (!existingUser) {
                appliedCorrections.push({
                  action: correction.action,
                  status: 'failed',
                  message: 'Usuário não existe para resetar senha',
                  timestamp: new Date().toISOString()
                })
              } else {
                console.log('🔑 [FixClientAuth] Resetando senha...')
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
                  action: correction.action,
                  status: 'success',
                  message: 'Senha resetada para "parceriadesucesso"',
                  timestamp: new Date().toISOString()
                })
                
                console.log('✅ [FixClientAuth] Senha resetada para usuário:', existingUser.id)
              }
              break

            case 'unconfirmed_email':
              if (!existingUser) {
                appliedCorrections.push({
                  action: correction.action,
                  status: 'failed',
                  message: 'Usuário não existe para confirmar email',
                  timestamp: new Date().toISOString()
                })
              } else {
                console.log('✉️ [FixClientAuth] Confirmando email...')
                const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
                  existingUser.id,
                  { email_confirm: true }
                )

                if (confirmError) {
                  throw confirmError
                }

                appliedCorrections.push({
                  action: correction.action,
                  status: 'success',
                  message: 'Email confirmado automaticamente',
                  timestamp: new Date().toISOString()
                })
                
                console.log('✅ [FixClientAuth] Email confirmado para usuário:', existingUser.id)
              }
              break
          }
        } catch (error: any) {
          console.error(`❌ [FixClientAuth] Erro na correção ${correction.type}:`, error)
          appliedCorrections.push({
            action: correction.action,
            status: 'failed',
            message: `Erro: ${error.message}`,
            timestamp: new Date().toISOString()
          })
        }
      }
    }

    // 4. ETAPA CRÍTICA: Validação pós-correção com login real
    let loginValidated = false
    console.log('🧪 [FixClientAuth] === VALIDAÇÃO PÓS-CORREÇÃO ===')
    
    const successfulCorrections = appliedCorrections.filter(c => c.status === 'success').length
    
    if (successfulCorrections > 0 || userExists) {
      console.log('🔐 [FixClientAuth] Testando login com senha padrão...')
      
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
        } else {
          console.log('⚠️ [FixClientAuth] Falha na validação do login:', loginError?.message)
        }
      } catch (error) {
        console.error('❌ [FixClientAuth] Erro no teste de login:', error)
      }
    }

    // 5. Log da operação no banco
    try {
      await supabaseAdmin
        .from('client_user_creation_log')
        .insert({
          email_cliente: normalizedEmail,
          operation_type: 'auto_corrections_v3',
          result_message: `Aplicadas ${successfulCorrections}/${appliedCorrections.length} correções. Login validado: ${loginValidated ? 'Sim' : 'Não'}. Cliente na base: ${clienteExists ? 'Sim' : 'Não'}. Duplicatas: ${clienteExists && warnings.some(w => w.includes('duplicados')) ? 'Sim' : 'Não'}`
        })
    } catch (logError) {
      console.error('⚠️ [FixClientAuth] Erro ao salvar log (não crítico):', logError)
      warnings.push('Erro ao salvar log da operação')
    }

    // 6. ETAPA CRÍTICA: Gerar mensagem final pronta para o cliente
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
      success: successfulCorrections > 0,
      totalCorrections: Math.max(appliedCorrections.length, 1), // Garantir que não seja 0
      successfulCorrections,
      loginValidated,
      clientMessage,
      warnings: warnings.length > 0 ? warnings : undefined
    }

    console.log('📝 [FixClientAuth] === RESULTADO FINAL ===')
    console.log('✅ Correções aplicadas:', successfulCorrections)
    console.log('🔐 Login validado:', loginValidated)
    console.log('📱 Mensagem gerada para cliente:', clientMessage ? 'Sim' : 'Não')
    console.log('📊 Total de correções:', result.totalCorrections)

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
        status: 200, // Sempre retornar 200 quando possível
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
  const failed = corrections.filter(c => c.status === 'failed')
  
  let message = `✅ ACESSO LIBERADO PARA O SISTEMA

Olá ${nomeCliente || 'Cliente'},

${loginValidated ? 'Seu acesso foi corrigido e está funcionando perfeitamente!' : 'Aplicamos as correções no seu acesso.'}`

  if (successful.length > 0) {
    message += `

🔧 CORREÇÕES REALIZADAS:
${successful.map(c => `• ${c.message}`).join('\n')}`
  }

  if (failed.length > 0) {
    message += `

⚠️ AVISOS:
${failed.map(c => `• ${c.message}`).join('\n')}`
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

${loginValidated ? '✅ STATUS: Acesso validado e funcionando' : '⚠️ STATUS: Aguardando teste de acesso'}
⏰ Processado em: ${new Date().toLocaleString('pt-BR')}

${loginValidated ? 'Seu acesso está 100% funcionando! Se tiver qualquer dúvida, estamos aqui.' : 'Teste o acesso e nos informe se houver algum problema.'}

Atenciosamente,
Equipe Suporte Técnico`

  return message
}

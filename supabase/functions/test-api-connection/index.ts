import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  }

  try {
    const { provider_name, provider_type, api_key } = await req.json()

    if (!provider_name || !provider_type || !api_key) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    let testResult = { success: false, message: '', details: {} }

    switch (provider_name.toLowerCase()) {
      case 'openai':
        testResult = await testOpenAI(api_key)
        break
      case 'runway':
        testResult = await testRunway(api_key)
        break
      case 'runware':
        testResult = await testRunware(api_key)
        break
      case 'huggingface':
        testResult = await testHuggingFace(api_key)
        break
      default:
        testResult = {
          success: false,
          message: `Provedor ${provider_name} não suportado para teste`,
          details: {}
        }
    }

    return new Response(
      JSON.stringify(testResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Test connection error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erro interno no teste de conexão',
        details: { error: error.message }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function testOpenAI(apiKey: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Conexão OpenAI estabelecida com sucesso',
        details: { 
          models_count: data.data?.length || 0,
          api_status: 'active'
        }
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        message: 'Falha na autenticação OpenAI',
        details: { 
          status: response.status,
          error: errorData.error?.message || 'Chave API inválida'
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro de conexão com OpenAI',
      details: { error: error.message }
    }
  }
}

async function testRunway(apiKey: string) {
  try {
    // Runway ML API test endpoint
    const response = await fetch('https://api.runwayml.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Conexão Runway estabelecida com sucesso',
        details: { 
          user_id: data.id || 'unknown',
          api_status: 'active'
        }
      }
    } else {
      return {
        success: false,
        message: 'Falha na autenticação Runway',
        details: { 
          status: response.status,
          error: 'Chave API inválida ou sem permissões'
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro de conexão com Runway',
      details: { error: error.message }
    }
  }
}

async function testRunware(apiKey: string) {
  try {
    // Test with a simple authentication request
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        taskType: "authentication",
        apiKey: apiKey
      }])
    })

    if (response.ok) {
      const data = await response.json()
      if (data.data && data.data[0]?.taskType === 'authentication') {
        return {
          success: true,
          message: 'Conexão Runware estabelecida com sucesso',
          details: { 
            session_uuid: data.data[0].connectionSessionUUID || 'unknown',
            api_status: 'active'
          }
        }
      }
    }
    
    return {
      success: false,
      message: 'Falha na autenticação Runware',
      details: { 
        status: response.status,
        error: 'Chave API inválida'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro de conexão com Runware',
      details: { error: error.message }
    }
  }
}

async function testHuggingFace(apiKey: string) {
  try {
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Conexão HuggingFace estabelecida com sucesso',
        details: { 
          username: data.name || 'unknown',
          api_status: 'active'
        }
      }
    } else {
      return {
        success: false,
        message: 'Falha na autenticação HuggingFace',
        details: { 
          status: response.status,
          error: 'Chave API inválida'
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro de conexão com HuggingFace',
      details: { error: error.message }
    }
  }
}
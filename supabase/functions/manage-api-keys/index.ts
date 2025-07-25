import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { 
        autoRefreshToken: false,
        persistSession: false 
      },
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')!,
        },
      },
    })

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userEmail = user.email!

    if (req.method === 'GET') {
      // Buscar configurações do usuário
      const { data: configurations, error } = await supabase
        .from('api_configurations')
        .select('*')
        .eq('email_usuario', userEmail)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching configurations:', error)
        return new Response(
          JSON.stringify({ error: 'Error fetching configurations' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ configurations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { provider_name, provider_type, api_key, is_default } = await req.json()

      if (!provider_name || !provider_type || !api_key) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Se está definindo como padrão, remover padrão anterior do mesmo tipo
      if (is_default) {
        await supabase
          .from('api_configurations')
          .update({ is_default: false })
          .eq('email_usuario', userEmail)
          .eq('provider_type', provider_type)
      }

      // Inserir ou atualizar configuração
      const { data, error } = await supabase
        .from('api_configurations')
        .upsert({
          provider_name,
          provider_type,
          api_key,
          is_default: is_default || false,
          email_usuario: userEmail,
          is_active: true
        }, {
          onConflict: 'email_usuario,provider_name,provider_type'
        })
        .select()

      if (error) {
        console.error('Error saving configuration:', error)
        return new Response(
          JSON.stringify({ error: 'Error saving configuration' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Configuration saved successfully', data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT') {
      const { id, is_default, provider_type } = await req.json()

      if (!id || is_default === undefined) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Se está definindo como padrão, remover padrão anterior do mesmo tipo
      if (is_default && provider_type) {
        await supabase
          .from('api_configurations')
          .update({ is_default: false })
          .eq('email_usuario', userEmail)
          .eq('provider_type', provider_type)
          .neq('id', id)
      }

      const { data, error } = await supabase
        .from('api_configurations')
        .update({ is_default })
        .eq('id', id)
        .eq('email_usuario', userEmail)
        .select()

      if (error) {
        console.error('Error updating configuration:', error)
        return new Response(
          JSON.stringify({ error: 'Error updating configuration' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Configuration updated successfully', data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'DELETE') {
      const { id } = await req.json()

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing configuration ID' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { error } = await supabase
        .from('api_configurations')
        .update({ is_active: false })
        .eq('id', id)
        .eq('email_usuario', userEmail)

      if (error) {
        console.error('Error deleting configuration:', error)
        return new Response(
          JSON.stringify({ error: 'Error deleting configuration' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Configuration deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
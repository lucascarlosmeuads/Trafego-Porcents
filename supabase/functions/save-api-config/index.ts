import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { openaiApiKey, runwayApiKey, imageProvider } = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user email from auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user?.email) {
      throw new Error('Unauthorized')
    }

    // Check if config exists
    const { data: existingConfig } = await supabase
      .from('api_providers_config')
      .select('id')
      .eq('email_usuario', user.email)
      .single()

    if (existingConfig) {
      // Update existing config
      const { error: updateError } = await supabase
        .from('api_providers_config')
        .update({
          openai_api_key: openaiApiKey,
          runway_api_key: runwayApiKey,
          image_provider: imageProvider,
          updated_at: new Date().toISOString()
        })
        .eq('email_usuario', user.email)

      if (updateError) {
        throw updateError
      }
    } else {
      // Insert new config
      const { error: insertError } = await supabase
        .from('api_providers_config')
        .insert({
          email_usuario: user.email,
          openai_api_key: openaiApiKey,
          runway_api_key: runwayApiKey,
          image_provider: imageProvider
        })

      if (insertError) {
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'API configuration saved successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error saving API config:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
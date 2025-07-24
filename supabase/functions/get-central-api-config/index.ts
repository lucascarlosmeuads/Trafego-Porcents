import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se é gestor
    const { data: isGestor } = await supabase.rpc('is_gestor_user');
    if (!isGestor) {
      return new Response(JSON.stringify({ error: 'Gestor access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar configuração centralizada
    const { data: config } = await supabase
      .from('meta_ads_configs')
      .select('api_id')
      .eq('email_usuario', 'system_central_config')
      .eq('cliente_id', null)
      .single();

    if (!config || !config.api_id) {
      return new Response(JSON.stringify({ 
        hasConfig: false,
        apiKey: null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      hasConfig: true,
      apiKey: config.api_id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in get-central-api-config:', error);
    return new Response(JSON.stringify({ 
      hasConfig: false,
      apiKey: null,
      error: 'Failed to fetch configuration' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
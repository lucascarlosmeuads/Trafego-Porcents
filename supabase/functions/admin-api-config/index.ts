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

    // Verificar se usuário é admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se é admin usando a função do banco
    const { data: isAdmin } = await supabase.rpc('is_admin_user');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET') {
      // Buscar configuração centralizada (sem expor a chave)
      const { data: config } = await supabase
        .from('meta_ads_configs')
        .select('id, email_usuario, created_at, updated_at')
        .eq('email_usuario', 'system_central_config')
        .eq('cliente_id', null)
        .single();

      return new Response(JSON.stringify({ 
        hasConfig: !!config,
        configuredAt: config?.created_at 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const { openaiKey } = await req.json();
      
      if (!openaiKey || openaiKey.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'OpenAI API key is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Salvar/atualizar configuração centralizada
      const { data, error } = await supabase
        .from('meta_ads_configs')
        .upsert({
          email_usuario: 'system_central_config',
          cliente_id: null,
          api_id: openaiKey, // Usando api_id para armazenar a chave OpenAI
          app_secret: 'central_openai_config',
          access_token: 'system',
          ad_account_id: 'central'
        }, { 
          onConflict: 'email_usuario,cliente_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving central config:', error);
        return new Response(JSON.stringify({ error: 'Failed to save configuration' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Central API configuration saved successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in admin-api-config:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
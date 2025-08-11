import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { dateRange } = await req.json()
    
    console.log('🔄 Iniciando reprocessamento webhooks:', dateRange)

    // 1. Buscar webhooks aprovados no período
    let webhookQuery = supabaseClient
      .from('kiwify_webhook_logs')
      .select('*')
      .eq('status_processamento', 'sucesso')

    if (dateRange?.startDate && dateRange?.endDate) {
      webhookQuery = webhookQuery
        .gte('created_at', `${dateRange.startDate}T00:00:00`)
        .lte('created_at', `${dateRange.endDate}T23:59:59`)
    }

    const { data: webhooks, error: webhookError } = await webhookQuery
    if (webhookError) throw webhookError

    console.log(`📊 Encontrados ${webhooks?.length || 0} webhooks para reprocessar`)

    let processed = 0
    let updated = 0
    let created = 0

    for (const webhook of webhooks || []) {
      if (!webhook.email_comprador) continue

      const normalizeEmail = (email: string) => 
        email.trim().toLowerCase()
          .replace('hotmil.com', 'hotmail.com')
          .replace('gmai.com', 'gmail.com')
          .replace('outlok.com', 'outlook.com')

      const emailNorm = normalizeEmail(webhook.email_comprador)
      
      // Extrair data de compra do webhook
      const wd = webhook.webhook_data || {}
      const extractDateIso = (...vals: any[]) => {
        for (const v of vals) {
          if (v && typeof v === 'string' && v.trim().length > 0) {
            const d = new Date(v)
            if (!isNaN(d.getTime())) return d.toISOString()
          }
        }
        return null
      }

      const dataCompra = extractDateIso(
        wd?.approved_at,
        wd?.paid_at,
        wd?.created_at,
        wd?.order?.approved_at,
        wd?.order?.paid_at,
        wd?.order?.created_at,
        wd?.data?.approved_at,
        wd?.data?.paid_at,
        wd?.data?.created_at,
      ) || new Date(webhook.created_at).toISOString()

      // Buscar lead correspondente
      const { data: leads, error: leadError } = await supabaseClient
        .from('formularios_parceria')
        .select('*')
        .ilike('email_usuario', emailNorm)
        .limit(1)

      if (leadError) {
        console.warn('⚠️ Erro ao buscar lead:', leadError)
        continue
      }

      processed++

      if (leads && leads.length > 0) {
        const lead = leads[0]
        
        // Verificar se precisa atualizar
        const needsUpdate = !lead.cliente_pago || 
                           lead.status_negociacao !== 'comprou' ||
                           !lead.data_compra

        if (needsUpdate) {
          const { error: updateError } = await supabaseClient
            .from('formularios_parceria')
            .update({
              cliente_pago: true,
              status_negociacao: 'comprou',
              data_compra: dataCompra
            })
            .eq('id', lead.id)

          if (updateError) {
            console.warn('⚠️ Erro ao atualizar lead:', updateError)
          } else {
            updated++
            console.log('✅ Lead atualizado:', emailNorm)
          }
        }
      } else {
        console.log('⚠️ Lead não encontrado para email:', emailNorm)
      }
    }

    const result = {
      success: true,
      processed,
      updated,
      created,
      webhooks_found: webhooks?.length || 0,
      dateRange
    }

    console.log('✅ Reprocessamento concluído:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro no reprocessamento:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
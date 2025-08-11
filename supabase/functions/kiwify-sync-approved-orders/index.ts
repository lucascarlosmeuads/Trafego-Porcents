// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  start_date: string; // ISO date (YYYY-MM-DD)
  end_date: string;   // ISO date (YYYY-MM-DD)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const KIWIFY_API_TOKEN = Deno.env.get('KIWIFY_API_TOKEN');

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service credentials' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (!KIWIFY_API_TOKEN) {
    return new Response(JSON.stringify({ error: 'Missing KIWIFY_API_TOKEN secret' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = (await req.json()) as SyncRequest;
    if (!body?.start_date || !body?.end_date) {
      return new Response(JSON.stringify({ error: 'start_date and end_date are required (YYYY-MM-DD)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const startISO = `${body.start_date}T00:00:00Z`;
    const endISO = `${body.end_date}T23:59:59Z`;

    // Fetch approved orders from Kiwify API
    // NOTE: Endpoint/shape may vary. Adjust as needed to your Kiwify account.
    const url = new URL('https://api.kiwify.com/v1/orders');
    url.searchParams.set('status', 'approved');
    url.searchParams.set('start_date', startISO);
    url.searchParams.set('end_date', endISO);
    url.searchParams.set('page_size', '200');

    let page = 1;
    let totalFetched = 0;
    let updated = 0;
    let inserted = 0;
    const details: any[] = [];

    while (true) {
      url.searchParams.set('page', String(page));
      const resp = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${KIWIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error('Kiwify API error', resp.status, text);
        return new Response(JSON.stringify({ error: 'Kiwify API request failed', status: resp.status, body: text }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const data = await resp.json();
      const orders: any[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

      if (!orders.length) break;
      totalFetched += orders.length;

      for (const order of orders) {
        const email = order?.buyer_email || order?.email || order?.customer?.email || null;
        const paidAtRaw = order?.approved_at || order?.paid_at || order?.created_at || null;
        const paidAt = paidAtRaw ? new Date(paidAtRaw).toISOString() : new Date().toISOString();

        if (!email) {
          details.push({ skipped: true, reason: 'no_email', order_id: order?.id });
          continue;
        }

        // Try to find existing lead by email
        const { data: existing, error: selErr } = await supabase
          .from('formularios_parceria')
          .select('id, status_negociacao, cliente_pago, data_compra')
          .eq('email_usuario', email)
          .maybeSingle();
        if (selErr) {
          console.error('Select error', selErr);
        }

        if (existing?.id) {
          const { error: updErr } = await supabase
            .from('formularios_parceria')
            .update({
              cliente_pago: true,
              status_negociacao: 'comprou',
              data_compra: paidAt,
            })
            .eq('id', existing.id);
          if (updErr) {
            console.error('Update error', updErr);
            details.push({ email, order_id: order?.id, action: 'update_failed', error: updErr?.message });
          } else {
            updated++;
            details.push({ email, order_id: order?.id, action: 'updated' });
          }
        } else {
          // Insert minimal purchased lead
          const { error: insErr } = await supabase
            .from('formularios_parceria')
            .insert({
              email_usuario: email,
              tipo_negocio: 'digital',
              respostas: {},
              produto_descricao: 'Compra via Kiwify',
              cliente_pago: true,
              status_negociacao: 'comprou',
              data_compra: paidAt,
              completo: false,
            });
          if (insErr) {
            console.error('Insert error', insErr);
            details.push({ email, order_id: order?.id, action: 'insert_failed', error: insErr?.message });
          } else {
            inserted++;
            details.push({ email, order_id: order?.id, action: 'inserted' });
          }
        }
      }

      // Pagination detection
      const hasNext = data?.next_page || (data?.pagination?.page < data?.pagination?.total_pages);
      if (!hasNext) break;
      page += 1;
    }

    const result = { totalFetched, updated, inserted, start_date: body.start_date, end_date: body.end_date, details };
    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('Sync error', e);
    return new Response(JSON.stringify({ error: e?.message || 'unexpected_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

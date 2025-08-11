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
  const KIWIFY_CLIENT_ID = Deno.env.get('KIWIFY_CLIENT_ID');
  const KIWIFY_CLIENT_SECRET = Deno.env.get('KIWIFY_CLIENT_SECRET');
  const KIWIFY_ACCOUNT_ID = Deno.env.get('KIWIFY_ACCOUNT_ID');

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service credentials' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (!KIWIFY_CLIENT_ID || !KIWIFY_CLIENT_SECRET || !KIWIFY_ACCOUNT_ID) {
    return new Response(JSON.stringify({ error: 'Missing Kiwify credentials (CLIENT_ID, CLIENT_SECRET, ACCOUNT_ID)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = (await req.json()) as SyncRequest;
    if (!body?.start_date || !body?.end_date) {
      return new Response(JSON.stringify({ error: 'start_date and end_date are required (YYYY-MM-DD)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const startISO = `${body.start_date}T00:00:00Z`;
    const endISO = `${body.end_date}T23:59:59Z`;

    // First, get OAuth Bearer token (use robust fallbacks)
    console.log('Getting OAuth token from Kiwify...');

    const formBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: KIWIFY_CLIENT_ID,
      client_secret: KIWIFY_CLIENT_SECRET,
    }).toString();

    // Multiple OAuth endpoints to try
    const tokenAttempts = [
      {
        url: 'https://api.kiwify.com/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${btoa(`${KIWIFY_CLIENT_ID}:${KIWIFY_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
      },
      {
        url: 'https://public-api.kiwify.com/v1/oauth/token',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded', 
          Accept: 'application/json',
          'User-Agent': 'Supabase-EdgeFunction/1.0'
        },
        body: formBody,
      },
      {
        url: 'https://api.kiwify.com/v1/oauth/token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: formBody,
      },
    ];

    let accessToken: string | null = null;
    let lastStatus: number | null = null;
    let lastBody: string | null = null;

    for (const attempt of tokenAttempts) {
      try {
        const resp = await fetch(attempt.url, {
          method: 'POST',
          headers: attempt.headers,
          body: attempt.body,
        });
        lastStatus = resp.status;
        const text = await resp.text();
        lastBody = text;
        if (!resp.ok) {
          console.error('Kiwify OAuth error', resp.status, text);
          continue;
        }
        try {
          const json = JSON.parse(text);
          accessToken = json?.access_token || null;
          if (accessToken) break;
          console.error('Kiwify OAuth: no access_token in response', json);
        } catch {
          console.error('Kiwify OAuth: invalid JSON response', text);
        }
      } catch (err) {
        console.error('Kiwify OAuth fetch failed', err);
      }
    }

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Failed to get Kiwify OAuth token', status: lastStatus, body: lastBody }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OAuth token obtained successfully');

    // Fetch approved orders from Kiwify API with enhanced error handling
    console.log(`Requesting Kiwify orders: ${startISO} to ${endISO}`);
    const baseUrls = [
      'https://api.kiwify.com/v1/orders',
      'https://public-api.kiwify.com/v1/orders'
    ];
    
    let selectedUrl = baseUrls[0];
    for (const baseUrl of baseUrls) {
      try {
        const testResp = await fetch(`${baseUrl}?page_size=1`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'x-kiwify-account-id': KIWIFY_ACCOUNT_ID,
            'User-Agent': 'Supabase-EdgeFunction/1.0'
          },
        });
        if (testResp.ok) {
          selectedUrl = baseUrl;
          console.log(`Using Kiwify API endpoint: ${selectedUrl}`);
          break;
        }
      } catch (e) {
        console.log(`Failed to connect to ${baseUrl}:`, e);
      }
    }

    const url = new URL(selectedUrl);
    url.searchParams.set('status', 'approved');
    url.searchParams.set('start_date', startISO);
    url.searchParams.set('end_date', endISO);
    url.searchParams.set('page_size', '200');

    let page = 1;
    let totalFetched = 0;
    let updated = 0;
    let inserted = 0;
    let alreadySynced = 0;
    let skipped = 0;
    const details: any[] = [];

    const newlyCreatedEmails = new Set<string>();
    
    console.log(`Starting Kiwify sync for period: ${startISO} to ${endISO}`);

    while (true) {
      url.searchParams.set('page', String(page));
      console.log(`Fetching page ${page} from ${url.toString()}`);
      const resp = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-kiwify-account-id': KIWIFY_ACCOUNT_ID,
          'User-Agent': 'Supabase-EdgeFunction/1.0',
          'Accept': 'application/json'
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
          skipped++;
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
          // Check if already synced to avoid unnecessary updates
          if (existing.cliente_pago === true && existing.status_negociacao === 'comprou') {
            alreadySynced++;
            details.push({ email, order_id: order?.id, action: 'already_synced', existing_data: existing });
            continue;
          }
          
          console.log(`Updating existing lead: ${email} (ID: ${existing.id})`);
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
            details.push({ email, order_id: order?.id, action: 'updated', lead_id: existing.id });
          }
        } else {
          // Insert minimal purchased lead for new Kiwify customers, avoiding duplicates in the same run
          if (newlyCreatedEmails.has(email)) {
            alreadySynced++;
            details.push({ email, order_id: order?.id, action: 'already_synced_in_run' });
            continue;
          }

          console.log(`Creating new lead for Kiwify customer: ${email}`);
          const { data: newLead, error: insErr } = await supabase
            .from('formularios_parceria')
            .insert({
              email_usuario: email,
              tipo_negocio: 'digital',
              respostas: {
                nome: order?.buyer_name || order?.customer?.name || 'Cliente Kiwify',
                origem: 'kiwify_sync'
              },
              produto_descricao: `Compra via Kiwify - Produto: ${order?.product?.name || 'Produto Kiwify'}`,
              cliente_pago: true,
              status_negociacao: 'comprou',
              data_compra: paidAt,
              completo: false,
            })
            .select('id')
            .single();
          if (insErr) {
            console.error('Insert error', insErr);
            details.push({ email, order_id: order?.id, action: 'insert_failed', error: insErr?.message });
          } else {
            newlyCreatedEmails.add(email);
            inserted++;
            details.push({ email, order_id: order?.id, action: 'inserted', lead_id: newLead?.id });
          }
        }
      }

      // Pagination detection
      const hasNext = data?.next_page || (data?.pagination?.page < data?.pagination?.total_pages);
      if (!hasNext) break;
      page += 1;
    }

    const result = { 
      totalFetched, 
      updated, 
      inserted, 
      alreadySynced,
      skipped,
      start_date: body.start_date, 
      end_date: body.end_date, 
      summary: `Processadas ${totalFetched} vendas da Kiwify: ${updated} atualizadas, ${inserted} inseridas, ${alreadySynced} já sincronizadas, ${skipped} ignoradas`,
      details 
    };
    console.log('Sync completed:', result.summary);
    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('Sync error', e);
    return new Response(JSON.stringify({ error: e?.message || 'unexpected_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

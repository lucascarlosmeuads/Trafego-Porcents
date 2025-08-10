import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(url, key);
}

type QueueItem = {
  id: string;
  lead_id: string;
  scheduled_at: string;
  status: string;
  attempts: number;
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    const supabase = getSupabaseAdmin();
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const limit = Math.max(1, Math.min(2, Number(body?.limit) || 2)); // hard cap 2 per run

    const nowIso = new Date().toISOString();

    // 1) Pick up to "limit" due and pending jobs
    const { data: jobs, error: pickErr } = await supabase
      .from('evolution_recovery_queue')
      .select('id, lead_id, scheduled_at, status, attempts')
      .lte('scheduled_at', nowIso)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true })
      .limit(limit);

    if (pickErr) {
      console.error('[recovery-queue] pick error', pickErr);
      return new Response(JSON.stringify({ requestId, success: false, error: pickErr.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const selected: QueueItem[] = jobs || [];

    const results: any[] = [];
    let processed = 0, sent = 0, failed = 0, skipped = 0;

    for (const job of selected) {
      // 2) Try to mark as processing atomically
      const { data: updData, error: updErr } = await supabase
        .from('evolution_recovery_queue')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', job.id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();

      if (updErr || !updData) {
        // Someone else picked it
        skipped++;
        results.push({ id: job.id, lead_id: job.lead_id, action: 'skipped', reason: updErr?.message || 'already taken' });
        continue;
      }

      processed++;

      // 3) Invoke the dispatcher function that handles templates and logging
      const { data: invokeData, error: invokeErr } = await supabase.functions.invoke('evolution-send-message', {
        body: { leadId: job.lead_id, testMode: false },
      });

      const ok = !invokeErr && !!invokeData;

      // 4) Update job outcome
      const newStatus = ok ? 'sent' : 'failed';
      const patch = {
        status: newStatus,
        last_attempt_at: new Date().toISOString(),
        attempts: (job.attempts || 0) + 1,
        result: ok ? invokeData : { error: invokeErr?.message || 'unknown error', data: invokeData }
      };

      const { error: finErr } = await supabase
        .from('evolution_recovery_queue')
        .update(patch)
        .eq('id', job.id);

      if (ok && !finErr) {
        sent++;
        results.push({ id: job.id, lead_id: job.lead_id, action: 'sent', response: invokeData });
      } else {
        failed++;
        results.push({ id: job.id, lead_id: job.lead_id, action: 'failed', error: invokeErr?.message || finErr?.message });
      }
    }

    const summary = { requestId, processed, sent, failed, skipped, picked: selected.length, limit };
    console.log('[recovery-queue]', JSON.stringify(summary));

    return new Response(JSON.stringify({ success: true, ...summary, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('❌ evolution-process-recovery-queue error:', e);
    return new Response(JSON.stringify({ success: false, error: e?.message || 'unknown error', requestId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

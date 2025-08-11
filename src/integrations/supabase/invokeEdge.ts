import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

export type InvokeEdgeResult<T = any> = { data: T | null; error: Error | null; status?: number; via: 'supabase' | 'fetch'; attempt: number };

export async function invokeEdge<T = any>(name: string, body: any, opts?: { timeoutMs?: number }): Promise<InvokeEdgeResult<T>> {
  const timeoutMs = opts?.timeoutMs ?? 12000;
  try {
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (!error) return { data: data as T, error: null, via: 'supabase', attempt: 1 };
    // If supabase invoke returned an error, try fallback fetch
    console.warn(`[invokeEdge] supabase.invoke error for ${name}:`, error?.message || error);
  } catch (e: any) {
    console.warn(`[invokeEdge] supabase.invoke threw for ${name}:`, e?.message || e);
  }

  // Fallback to direct fetch with two header strategies
  const url = `${SUPABASE_URL}/functions/v1/${name}`;
  // Try to use the current user's JWT for authenticated functions
  const { data: authData } = await supabase.auth.getSession();
  const userJwt = authData?.session?.access_token || '';

  const headersList: Array<Record<string, string>> = [
    // Prefer real user JWT + apikey
    { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${userJwt}`, 'Content-Type': 'application/json', 'x-client-info': 'lovable-app' },
    // Some projects accept anon key as bearer as fallback
    { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`, 'Content-Type': 'application/json', 'x-client-info': 'lovable-app' },
    // Pure apikey fallback
    { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json', 'x-client-info': 'lovable-app' },
  ];

  let lastErr: any = null;
  for (let i = 0; i < headersList.length; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { method: 'POST', headers: headersList[i], body: JSON.stringify(body ?? {}), signal: controller.signal });
      clearTimeout(timer);
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = text; }
      if (!res.ok) {
        const err = new Error(typeof data === 'object' ? (data?.error || `HTTP ${res.status}`) : `HTTP ${res.status}`);
        return { data: null, error: err, status: res.status, via: 'fetch', attempt: i + 1 };
      }
      return { data: data as T, error: null, status: res.status, via: 'fetch', attempt: i + 1 };
    } catch (e: any) {
      lastErr = e;
      console.warn(`[invokeEdge] fetch attempt ${i + 1} failed for ${name}:`, e?.message || e);
      continue;
    }
  }

  return { data: null, error: lastErr || new Error('Failed to send a request to the Edge Function'), via: 'fetch', attempt: headersList.length };
}

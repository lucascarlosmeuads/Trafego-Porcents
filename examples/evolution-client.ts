
// Simple Node/TS client (no external deps). Requires Node 18+ (fetch built-in).
// Usage:
//   BASE_URL=http://72.60.7.194:8081 API_KEY=51bf0f74a62dac67f6ad9f45ae2c319a ts-node examples/evolution-client.ts

const BASE_URL = (process.env.BASE_URL || "http://72.60.7.194:8081").replace(/\/$/, "");
const API_KEY = process.env.API_KEY || "51bf0f74a62dac67f6ad9f45ae2c319a";

async function http<T = any>(path: string, init: RequestInit = {}, timeoutMs = 10000): Promise<{ status: number; data: T; }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        apikey: API_KEY,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
    const text = await res.text();
    let json: any;
    try { json = text ? JSON.parse(text) : {}; } catch { json = text as any; }
    return { status: res.status, data: json as T };
  } finally {
    clearTimeout(t);
  }
}

export async function getHealth() {
  return http("/", { method: "GET" });
}

export async function getConnectionState(instance: string) {
  return http(`/instance/connectionState/${instance}`, { method: "GET" });
}

export async function sendText(instance: string, number: string, text: string) {
  return http(`/message/sendText/${instance}`, { method: "POST", body: JSON.stringify({ number, text }) });
}

// Demo
if (require.main === module) {
  (async () => {
    console.log("Health:", await getHealth());
    console.log("State:", await getConnectionState(process.env.INSTANCE || "lucas"));
    console.log("Send:", await sendText(process.env.INSTANCE || "lucas", process.env.NUMBER || "554892095244", "Teste via Evolution ✅"));
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

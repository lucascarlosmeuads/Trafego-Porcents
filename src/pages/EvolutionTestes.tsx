
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface ExecLog { time: string; action: string; requestId?: string; info?: any }

function useExecLogs() {
  const [logs, setLogs] = useState<ExecLog[]>([]);
  const add = (entry: ExecLog) => setLogs((l) => [...l, entry]);
  const clear = () => setLogs([]);
  return { logs, add, clear };
}

function useDocHead() {
  useEffect(() => {
    document.title = "Evolution › Testes";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Painel de testes Evolution API: conexão, verificação ponta-a-ponta e envio de mensagens WhatsApp.");
    } else {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      m.setAttribute("content", "Painel de testes Evolution API: conexão, verificação ponta-a-ponta e envio de mensagens WhatsApp.");
      document.head.appendChild(m);
    }
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) link.href = window.location.href; else {
      const l = document.createElement("link");
      l.rel = "canonical"; l.href = window.location.href; document.head.appendChild(l);
    }
  }, []);
}

export default function EvolutionTestes() {
  useDocHead();
  const { logs, add, clear } = useExecLogs();

  // Estado da conexão / health
  const [connState, setConnState] = useState<string>("unknown");
  const [healthMs, setHealthMs] = useState<number | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [loadingConn, setLoadingConn] = useState(false);
  const [recovering, setRecovering] = useState(false);

  // Envio rápido
  const [number, setNumber] = useState("554892095244");
  const [text, setText] = useState("Teste via Evolution ✅");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  // Verificação ponta-a-ponta
  const [verifying, setVerifying] = useState(false);
  const [verifyReport, setVerifyReport] = useState<any>(null);

  // Webhooks
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [whLoading, setWhLoading] = useState(false);
  const [whSearch, setWhSearch] = useState("");
  const [whStart, setWhStart] = useState<string>("");
  const [whEnd, setWhEnd] = useState<string>("");
  const [payloadOpen, setPayloadOpen] = useState(false);
  const [payloadJson, setPayloadJson] = useState<any>(null);

  const badgeVariant = useMemo(() => {
    switch (connState) {
      case "connected": return "default" as const;
      case "connecting": return "secondary" as const;
      case "disconnected": return "destructive" as const;
      default: return "outline" as const;
    }
  }, [connState]);

  const pollConnection = async (timeoutMs = 20000) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const ok = await refreshConnection(false);
      if (ok && connState === "connected") return true;
      await new Promise((r) => setTimeout(r, 1500));
    }
    return false;
  };

  const refreshConnection = async (notify = true) => {
    setLoadingConn(true);
    try {
      const { data, error } = await supabase.functions.invoke("evolution-check-connection", { body: {} });
      if (error) throw error;
      const state = data?.connectionState || data?.state || data?.status || "unknown";
      setConnState(state);
      if (notify) add({ time: new Date().toISOString(), action: "connectionState", info: state });
      return state === "connected";
    } catch (e: any) {
      setConnState("error");
      if (notify) add({ time: new Date().toISOString(), action: "connectionState:error", info: e?.message });
      return false;
    } finally {
      setLoadingConn(false);
    }
  };

  const runHealthcheck = async () => {
    try {
      const t0 = performance.now();
      const { data, error } = await supabase.functions.invoke("evolution-verify", { body: {} });
      const elapsed = Math.round(performance.now() - t0);
      setHealthMs(elapsed);
      if (error) throw error;
      const ver = data?.health?.version || data?.version || data?.root?.version || null;
      setVersion(ver);
      add({ time: new Date().toISOString(), action: "healthcheck", info: { version: ver, ms: elapsed } });
    } catch (e: any) {
      add({ time: new Date().toISOString(), action: "healthcheck:error", info: e?.message });
      toast({ title: "Healthcheck falhou", description: e?.message || "Erro desconhecido", variant: "destructive" });
    }
  };

  const handleRecover = async () => {
    setRecovering(true);
    try {
      const { data, error } = await supabase.functions.invoke("evolution-recover-connection", { body: {} });
      if (error) throw error;
      add({ time: new Date().toISOString(), action: "recover", info: data });
      await pollConnection(20000);
      toast({ title: "Recuperação acionada", description: "Verificando estado por até 20s." });
    } catch (e: any) {
      add({ time: new Date().toISOString(), action: "recover:error", info: e?.message });
      toast({ title: "Falha ao recuperar", description: e?.message || "Erro desconhecido", variant: "destructive" });
    } finally {
      setRecovering(false);
    }
  };

  const handleSend = async () => {
    const digits = number.replace(/\D/g, "");
    if (!/^\d{8,15}$/.test(digits)) {
      toast({ title: "Número inválido", description: "Use apenas dígitos com DDI/DDD.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("evolution-send-text", {
        body: { number: digits, text },
      });
      if (error) throw error;
      setSendResult(data);
      add({ time: new Date().toISOString(), action: "sendText", requestId: data?.requestId, info: { status: data?.status, ms: data?.responseTimeMs } });
      toast({ title: data?.success ? "Enviado" : "Falhou", description: `HTTP ${data?.status} • ${data?.responseTimeMs}ms` });
    } catch (e: any) {
      add({ time: new Date().toISOString(), action: "sendText:error", info: e?.message });
      toast({ title: "Erro no envio", description: e?.message || "Erro desconhecido", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyReport(null);
    try {
      const { data, error } = await supabase.functions.invoke("evolution-verify", {
        body: { number: number.replace(/\D/g, "") },
      });
      if (error) throw error;
      setVerifyReport(data);
      add({ time: new Date().toISOString(), action: "verify", info: data });
    } catch (e: any) {
      add({ time: new Date().toISOString(), action: "verify:error", info: e?.message });
      toast({ title: "Verificação falhou", description: e?.message || "Erro desconhecido", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const loadWebhooks = async () => {
    setWhLoading(true);
    try {
      let q = supabase.from("evolution_webhook_events").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(50);
      if (whSearch) q = q.ilike("event_type", `%${whSearch}%`);
      if (whStart) q = q.gte("created_at", whStart);
      if (whEnd) q = q.lte("created_at", whEnd);
      const { data, error } = await q;
      if (error) throw error;
      setWebhooks(data || []);
      add({ time: new Date().toISOString(), action: "webhooks:loaded", info: (data || []).length });
    } catch (e: any) {
      add({ time: new Date().toISOString(), action: "webhooks:error", info: e?.message });
      toast({ title: "Erro ao carregar webhooks", description: e?.message || "Erro desconhecido", variant: "destructive" });
    } finally {
      setWhLoading(false);
    }
  };

  useEffect(() => {
    refreshConnection(false);
    runHealthcheck();
    loadWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderVerifyRow = (label: string, ok: any, extra?: any) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <span className="font-medium">{label}</span>
        {ok ? <Badge variant="default">✔</Badge> : <Badge variant="destructive">❌</Badge>}
      </div>
      {extra ? <span className="text-sm text-muted-foreground">{extra}</span> : null}
    </div>
  );

  return (
    <main className="container mx-auto max-w-6xl py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Evolution › Testes</h1>
        <p className="text-muted-foreground">Operação 100% pelo app usando Edge Functions e segredos.</p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado da conexão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant={badgeVariant as any}>{connState}</Badge>
              {version ? <span className="text-sm">versão: {version}</span> : null}
              {healthMs != null ? <span className="text-sm">health: {healthMs}ms</span> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => refreshConnection()} disabled={loadingConn}>Atualizar</Button>
              <Button variant="secondary" onClick={runHealthcheck}>Reexecutar healthcheck</Button>
              {connState !== "connected" && (
                <Button variant="outline" onClick={handleRecover} disabled={recovering}>
                  {recovering ? "Recuperando..." : "Recuperar conexão"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enviar mensagem (rápido)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="number">Número (DDI+DDD+Número, só dígitos)</Label>
                <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="5548999999999" />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="text">Mensagem</Label>
                <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={2} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSend} disabled={sending}>{sending ? "Enviando..." : "Enviar"}</Button>
              {sendResult && (
                <span className="text-sm text-muted-foreground">HTTP {sendResult?.status} • {sendResult?.responseTimeMs}ms</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Verificação ponta-a-ponta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Button onClick={handleVerify} disabled={verifying}>{verifying ? "Verificando..." : "Rodar verificação"}</Button>
              <span className="text-sm text-muted-foreground">Health → conexão (20s) → envio para o número informado</span>
            </div>
            {verifyReport && (
              <div className="rounded-md border p-3 space-y-1">
                {renderVerifyRow("Healthcheck", verifyReport?.health?.ok ?? verifyReport?.health_ok ?? verifyReport?.health?.success)}
                {renderVerifyRow("Conexão", verifyReport?.connection?.ok ?? verifyReport?.connection_ok ?? (verifyReport?.connectionState === "connected"))}
                {renderVerifyRow("Envio", verifyReport?.send?.ok ?? verifyReport?.send_ok ?? verifyReport?.send?.success)}
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground mt-2">{JSON.stringify(verifyReport, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Webhooks recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <Label>event_type</Label>
                <Input value={whSearch} onChange={(e) => setWhSearch(e.target.value)} placeholder="message.any" />
              </div>
              <div>
                <Label>Início</Label>
                <Input type="datetime-local" value={whStart} onChange={(e) => setWhStart(e.target.value)} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="datetime-local" value={whEnd} onChange={(e) => setWhEnd(e.target.value)} />
              </div>
              <div className="flex items-end">
                <div className="flex gap-2">
                  <Button onClick={loadWebhooks} disabled={whLoading}>{whLoading ? "Carregando..." : "Buscar"}</Button>
                  <Button variant="outline" onClick={() => { setWhSearch(""); setWhStart(""); setWhEnd(""); }}>Limpar</Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>created_at</TableHead>
                    <TableHead>event_type</TableHead>
                    <TableHead>instance</TableHead>
                    <TableHead>status</TableHead>
                    <TableHead>payload</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>{format(new Date(w.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</TableCell>
                      <TableCell>{w.event_type}</TableCell>
                      <TableCell>{w.instance_name}</TableCell>
                      <TableCell>
                        <Badge variant={w.status === "received" ? "secondary" : w.status === "error" ? "destructive" : "outline"}>{w.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => { setPayloadJson(w.payload); setPayloadOpen(true); }}>Ver payload</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Logs de execução</h2>
          <Button size="sm" variant="outline" onClick={clear}>Limpar</Button>
        </div>
        <div className="rounded-md border p-2 max-h-60 overflow-auto text-xs">
          {logs.length === 0 ? <div className="text-muted-foreground">Sem logs ainda</div> : (
            <ul className="space-y-1">
              {logs.map((l, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{format(new Date(l.time), "HH:mm:ss", { locale: ptBR })}</span>
                  <span className="font-mono flex-1">{l.action}</span>
                  {l.requestId ? <span className="text-muted-foreground">{l.requestId}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Dialog open={payloadOpen} onOpenChange={setPayloadOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payload</DialogTitle>
          </DialogHeader>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[60vh]">{JSON.stringify(payloadJson, null, 2)}</pre>
        </DialogContent>
      </Dialog>
    </main>
  );
}


-- 1) Extensões para agendamento e HTTP interno (caso ainda não estejam habilitadas)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- 2) Tabela de configuração do envio Waseller
create table if not exists public.waseller_dispatch_config (
  id uuid primary key default gen_random_uuid(),
  enabled boolean not null default true,
  -- URL base do Waseller (ajustável)
  base_url text not null default 'https://api-whatsapp.wascript.com.br',
  -- Caminho do endpoint (ajustável depois conforme a documentação exata)
  endpoint_path text not null default '/api/v1/leads/import',
  -- Ex.: campanha/fluxo/fila na Waseller (se aplicável)
  campaign_id text null,
  -- Normalização de telefone
  default_country_code text not null default '+55',
  -- Só selecionar leads com "idade mínima" (em minutos)
  min_lead_age_minutes integer not null default 15,
  -- Limite por minuto (seu pedido: 2/min)
  max_per_minute integer not null default 2,
  -- Status de interesse (por padrão, só "pendente"; NULL será tratado na função)
  target_statuses text[] not null default array['pendente'],
  -- Se true, considera apenas leads sem vendedor atribuído
  require_null_vendedor boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.waseller_dispatch_config enable row level security;

-- Somente admins podem gerenciar configs
create policy if not exists "Admins manage waseller config"
  on public.waseller_dispatch_config
  as permissive
  for all
  using (is_admin_user())
  with check (is_admin_user());

-- Trigger para updated_at
drop trigger if exists set_waseller_config_updated_at on public.waseller_dispatch_config;
create trigger set_waseller_config_updated_at
  before update on public.waseller_dispatch_config
  for each row execute procedure public.update_updated_at_column();

-- 3) Tabela de logs de disparo (auditoria e idempotência)
create table if not exists public.waseller_dispatch_logs (
  id uuid primary key default gen_random_uuid(),
  -- ID do lead (formularios_parceria.id é UUID)
  lead_id uuid not null,
  email text,
  phone text,
  -- status e sucesso
  status text not null default 'queued',  -- queued | sent | failed | skipped
  success boolean not null default false,
  attempts integer not null default 0,
  error_message text,
  -- auditoria de request/response
  request_payload jsonb not null default '{}'::jsonb,
  response_body jsonb,
  dispatched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.waseller_dispatch_logs enable row level security;

-- Somente admins podem consultar/gerenciar
create policy if not exists "Admins can view waseller logs"
  on public.waseller_dispatch_logs
  as permissive
  for select
  using (is_admin_user());

create policy if not exists "Admins can insert waseller logs"
  on public.waseller_dispatch_logs
  as permissive
  for insert
  with check (is_admin_user());

create policy if not exists "Admins can update waseller logs"
  on public.waseller_dispatch_logs
  as permissive
  for update
  using (is_admin_user())
  with check (is_admin_user());

-- Índices de performance
create index if not exists idx_waseller_logs_lead_id on public.waseller_dispatch_logs(lead_id);
create index if not exists idx_waseller_logs_status on public.waseller_dispatch_logs(status);
create index if not exists idx_waseller_logs_dispatched_at on public.waseller_dispatch_logs(dispatched_at);

-- Idempotência: impedir duplicidade quando já houve sucesso
create unique index if not exists uq_waseller_logs_lead_success
  on public.waseller_dispatch_logs(lead_id)
  where success = true;

-- 4) Índice para seleção rápida dos leads elegíveis
create index if not exists idx_form_parceria_auto_select
  on public.formularios_parceria (cliente_pago, contatado_whatsapp, status_negociacao, created_at);

-- 5) Inserir uma linha de configuração padrão se não existir
insert into public.waseller_dispatch_config (enabled, campaign_id)
select true, null
where not exists (select 1 from public.waseller_dispatch_config);

-- 6) Agendar execução a cada 1 minuto do Edge Function (será criado no próximo passo)
--    Usa o ANON KEY para autenticação da função.
select
  cron.schedule(
    'whatsapp-waseller-auto-dispatch-1m',
    '* * * * *',
    $$
    select
      net.http_post(
        url:='https://rxpgqunqsegypssoqpyf.functions.supabase.co/whatsapp-waseller-auto-dispatch',
        headers:='{
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cGdxdW5xc2VneXBzc29xcHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzEyODcsImV4cCI6MjA2MzE0NzI4N30.9ZzV-alsdI4EqrzRwFDxP9Vjr2l_KXHMPN9dVyf5ZWI"
        }'::jsonb,
        body:='{}'::jsonb
      );
    $$
  );

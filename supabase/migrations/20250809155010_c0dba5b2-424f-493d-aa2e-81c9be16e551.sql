
-- 1) Tabela para templates manuais por usuário
create table if not exists public.waseller_manual_templates (
  id uuid primary key default gen_random_uuid(),
  email_usuario text not null,
  context text not null default 'leads_parceria',
  template_text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(email_usuario, context)
);

alter table public.waseller_manual_templates enable row level security;

-- Políticas: admin pode tudo; usuário só no próprio registro
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'waseller_manual_templates'
      and policyname = 'Admins can manage all waseller templates'
  ) then
    create policy "Admins can manage all waseller templates"
      on public.waseller_manual_templates
      as permissive
      for all
      using (is_admin_user())
      with check (is_admin_user());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'waseller_manual_templates'
      and policyname = 'Users can manage their own waseller templates'
  ) then
    create policy "Users can manage their own waseller templates"
      on public.waseller_manual_templates
      as permissive
      for all
      using (email_usuario = auth.email())
      with check (email_usuario = auth.email());
  end if;
end $$;

-- Atualização automática do updated_at
do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_timestamp_waseller_manual_templates'
  ) then
    create trigger set_timestamp_waseller_manual_templates
      before update on public.waseller_manual_templates
      for each row
      execute function public.update_updated_at_column();
  end if;
end $$;

-- 2) Ajuste nos logs de envio (criados pelo módulo de auto-dispatch)
-- Adiciona tipo de disparo manual/auto
alter table if exists public.waseller_dispatch_logs
  add column if not exists trigger_type text not null default 'auto';

-- Garante valores válidos
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'waseller_dispatch_logs_trigger_type_chk'
  ) then
    alter table public.waseller_dispatch_logs
      add constraint waseller_dispatch_logs_trigger_type_chk
      check (trigger_type in ('auto','manual'));
  end if;
end $$;

-- Opcional: referenciar o template usado no envio manual
alter table if exists public.waseller_dispatch_logs
  add column if not exists message_template_id uuid;

-- (Opcional) se desejar FK:
-- alter table public.waseller_dispatch_logs
--   add constraint waseller_dispatch_logs_template_fk
--   foreign key (message_template_id) references public.waseller_manual_templates(id) on delete set null;


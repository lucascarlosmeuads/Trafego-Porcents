-- Corrigir porta do Evolution server para 8081 (conforme envio direto bem-sucedido)
UPDATE public.waseller_dispatch_config
SET server_url = 'http://72.60.7.194:8081'
WHERE api_type = 'evolution' AND enabled = true;
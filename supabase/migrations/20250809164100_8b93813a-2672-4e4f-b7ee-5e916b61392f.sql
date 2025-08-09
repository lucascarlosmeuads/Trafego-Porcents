-- Atualiza configuração para Wascript
UPDATE public.waseller_dispatch_config 
SET base_url = 'https://api-whatsapp.wascript.com.br',
    endpoint_path = '/api/enviar-texto/{token}'
WHERE enabled = true;
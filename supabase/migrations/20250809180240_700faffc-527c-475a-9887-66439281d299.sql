-- Add Evolution API fields to waseller_dispatch_config
ALTER TABLE public.waseller_dispatch_config 
ADD COLUMN IF NOT EXISTS api_key TEXT,
ADD COLUMN IF NOT EXISTS instance_name TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS server_url TEXT DEFAULT 'https://evolution-api.com',
ADD COLUMN IF NOT EXISTS api_type TEXT DEFAULT 'evolution' CHECK (api_type IN ('waseller', 'evolution'));

-- Update existing records to use Evolution API type
UPDATE public.waseller_dispatch_config 
SET api_type = 'evolution'
WHERE api_type IS NULL;
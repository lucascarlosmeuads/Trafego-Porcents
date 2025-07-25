-- Create table for API providers configuration
CREATE TABLE public.api_providers_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_usuario TEXT NOT NULL,
  openai_api_key TEXT,
  runway_api_key TEXT,
  image_provider TEXT NOT NULL DEFAULT 'openai',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_providers_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own API config" 
ON public.api_providers_config 
FOR ALL 
USING (email_usuario = auth.email())
WITH CHECK (email_usuario = auth.email());

-- Create trigger for updated_at
CREATE TRIGGER update_api_providers_config_updated_at
BEFORE UPDATE ON public.api_providers_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create table to store discovered endpoints
CREATE TABLE public.evolution_discovered_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_url TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  endpoint_path TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  status_code INTEGER NOT NULL,
  payload_format JSONB DEFAULT '{}',
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_tested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_working BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evolution_discovered_endpoints ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage discovered endpoints" 
ON public.evolution_discovered_endpoints 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create index for faster lookups
CREATE INDEX idx_evolution_discovered_endpoints_lookup 
ON public.evolution_discovered_endpoints (server_url, instance_name, is_working DESC, priority DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_evolution_discovered_endpoints_updated_at
BEFORE UPDATE ON public.evolution_discovered_endpoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
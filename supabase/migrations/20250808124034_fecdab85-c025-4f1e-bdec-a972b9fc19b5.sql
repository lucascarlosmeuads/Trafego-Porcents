-- Add flag to mark leads with insufficient information for plan generation
ALTER TABLE public.formularios_parceria
ADD COLUMN IF NOT EXISTS precisa_mais_info boolean NOT NULL DEFAULT false;
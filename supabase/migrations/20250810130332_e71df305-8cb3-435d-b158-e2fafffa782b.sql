-- Move extensions to the proper schema to satisfy security linter
DO $$ BEGIN
  PERFORM 1 FROM pg_namespace WHERE nspname = 'extensions';
  IF NOT FOUND THEN
    -- Create extensions schema if it doesn't exist
    CREATE SCHEMA IF NOT EXISTS extensions;
  END IF;
END $$;

-- If extensions exist in the wrong schema, move them
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    EXECUTE 'ALTER EXTENSION pg_cron SET SCHEMA extensions';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    EXECUTE 'ALTER EXTENSION pg_net SET SCHEMA extensions';
  END IF;
END $$;
-- Force update/insert correct Evolution API configuration
INSERT INTO waseller_dispatch_config (
    api_type, 
    enabled, 
    server_url, 
    instance_name, 
    default_country_code,
    created_at,
    updated_at
) VALUES (
    'evolution',
    true,
    'http://72.60.7.194:8080',
    'lucas',
    '+55',
    NOW(),
    NOW()
) ON CONFLICT (api_type) DO UPDATE SET
    enabled = EXCLUDED.enabled,
    server_url = EXCLUDED.server_url,
    instance_name = EXCLUDED.instance_name,
    default_country_code = EXCLUDED.default_country_code,
    updated_at = EXCLUDED.updated_at;
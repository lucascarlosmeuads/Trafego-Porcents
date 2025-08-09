-- Update the existing wrong Evolution config with correct data
UPDATE waseller_dispatch_config 
SET 
    server_url = 'http://72.60.7.194:8080',
    instance_name = 'lucas',
    default_country_code = '+55',
    enabled = true,
    updated_at = NOW()
WHERE id = '3b861097-511c-4dce-bc7c-a12eab6b1267';
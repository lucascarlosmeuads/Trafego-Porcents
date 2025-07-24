-- Reset password for clientenovo user
UPDATE auth.users 
SET 
  encrypted_password = crypt('clientenovo123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'clientenovo@trafegoporcents.com';
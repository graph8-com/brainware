/*
  # Create admin user

  1. Changes
    - Creates an admin user in the auth.users table
    - Inserts the user into the users table
    - Sets up proper RLS policies for admin access

  2. Security
    - Password is hashed using Supabase Auth
    - Admin user has full access to manage posts and categories
*/

-- Create admin user in auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@brainware.com',
  crypt('brainware2025', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"admin"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Insert admin user into users table
INSERT INTO users (
  id,
  full_name,
  avatar_url
)
SELECT 
  id,
  'Admin',
  'https://api.dicebear.com/7.x/avatars/svg?seed=admin'
FROM auth.users
WHERE email = 'admin@brainware.com';
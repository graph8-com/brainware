/*
  # Fix admin authentication

  1. Changes
    - Drops and recreates admin user with proper auth settings
    - Ensures admin user exists in both auth.users and public.users tables
    - Sets up proper email confirmation and authentication

  2. Security
    - Uses secure password hashing
    - Sets up proper user metadata
*/

-- First remove existing admin user if exists
DELETE FROM auth.users WHERE email = 'admin@brainware.com';
DELETE FROM public.users WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@brainware.com');

-- Create admin user in auth.users table with proper settings
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
  recovery_token,
  aud,
  role
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
  '',
  'authenticated',
  'authenticated'
);

-- Insert admin user into public.users table
INSERT INTO public.users (
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
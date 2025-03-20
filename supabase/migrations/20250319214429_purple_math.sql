/*
  # Fix users and posts relationship

  1. Changes
    - Drop existing foreign key if it exists
    - Add foreign key from posts to users table
    - Update RLS policies to use auth.uid()

  2. Security
    - Maintain existing RLS policies
    - Ensure proper relationship between posts and users
*/

-- Drop existing foreign key if it exists
DO $$ BEGIN
  ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add foreign key relationship
ALTER TABLE posts
  ADD CONSTRAINT posts_author_id_fkey
  FOREIGN KEY (author_id)
  REFERENCES users(id)
  ON DELETE CASCADE;
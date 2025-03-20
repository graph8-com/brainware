/*
  # Update RLS policies for posts table

  1. Changes
    - Enable RLS on posts table
    - Add RLS policies for posts

  2. Security
    - Authors can manage their own posts
    - Public can read published posts
*/

-- Enable RLS on posts table if not already enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
DO $$ BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow authors to manage their own posts" ON posts;
  DROP POLICY IF EXISTS "Allow public read access to published posts" ON posts;
END $$;

-- Create new policies
CREATE POLICY "Allow authors to manage their own posts"
  ON posts
  FOR ALL
  TO public
  USING (auth.uid() = author_id);

CREATE POLICY "Allow public read access to published posts"
  ON posts
  FOR SELECT
  TO public
  USING (status = 'published');
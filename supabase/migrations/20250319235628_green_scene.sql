/*
  # Fix Featured Posts Functionality

  1. Changes
    - Drop existing triggers and function
    - Create improved function to handle featured post updates
    - Add proper triggers with better conditions
    - Add index for performance

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing triggers and function
DROP TRIGGER IF EXISTS manage_featured_posts_insert ON posts;
DROP TRIGGER IF EXISTS manage_featured_posts_update ON posts;
DROP FUNCTION IF EXISTS handle_featured_post();

-- Create improved function to handle featured post updates
CREATE OR REPLACE FUNCTION handle_featured_post()
RETURNS TRIGGER AS $$
BEGIN
    -- If we're setting this post as featured
    IF NEW.is_featured = true THEN
        -- Unfeature all other posts first
        UPDATE posts 
        SET is_featured = false 
        WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND is_featured = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create separate triggers for INSERT and UPDATE with appropriate conditions
CREATE TRIGGER manage_featured_posts_insert
    BEFORE INSERT ON posts
    FOR EACH ROW
    WHEN (NEW.is_featured = true)
    EXECUTE FUNCTION handle_featured_post();

CREATE TRIGGER manage_featured_posts_update
    BEFORE UPDATE ON posts
    FOR EACH ROW
    WHEN (NEW.is_featured IS DISTINCT FROM OLD.is_featured)
    EXECUTE FUNCTION handle_featured_post();

-- Add index on is_featured column for better performance
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts (is_featured) WHERE is_featured = true;
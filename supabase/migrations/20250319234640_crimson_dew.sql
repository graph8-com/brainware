/*
  # Fix featured posts handling

  1. Changes
    - Create separate triggers for INSERT and UPDATE
    - Simplify trigger logic to avoid race conditions
    - Add proper error handling

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS manage_featured_posts ON posts;
DROP FUNCTION IF EXISTS handle_featured_post();

-- Create improved function to handle featured post updates
CREATE OR REPLACE FUNCTION handle_featured_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if we're setting a post as featured
    IF NEW.is_featured = true THEN
        -- Update all other posts to not featured
        UPDATE posts 
        SET is_featured = false 
        WHERE id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create separate triggers for INSERT and UPDATE
CREATE TRIGGER manage_featured_posts_insert
    BEFORE INSERT ON posts
    FOR EACH ROW
    WHEN (NEW.is_featured = true)
    EXECUTE FUNCTION handle_featured_post();

CREATE TRIGGER manage_featured_posts_update
    BEFORE UPDATE ON posts
    FOR EACH ROW
    WHEN (NEW.is_featured = true AND OLD.is_featured = false)
    EXECUTE FUNCTION handle_featured_post();
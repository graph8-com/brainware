/*
  # Fix featured post trigger

  1. Changes
    - Drop existing triggers and function
    - Create new function to handle featured posts
    - Add new triggers for insert and update
    - Fix single row return issue

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
        WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for INSERT and UPDATE
CREATE TRIGGER manage_featured_posts_insert
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_featured_post();

CREATE TRIGGER manage_featured_posts_update
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_featured_post();
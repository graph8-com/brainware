/*
  # Fix featured post trigger functionality
  
  1. Changes
    - Improve trigger logic to handle both featuring and unfeaturing posts
    - Add function to manage featured post state
    - Fix edge cases in trigger logic
  
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
        -- Unfeature all other posts
        UPDATE posts 
        SET is_featured = false 
        WHERE id != NEW.id 
        AND is_featured = true;
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
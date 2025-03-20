/*
  # Fix featured posts handling

  1. Changes
    - Add trigger to ensure only one featured post at a time
    - Update existing featured posts handling

  2. Security
    - Maintain existing RLS policies
*/

-- Create function to handle featured post updates
CREATE OR REPLACE FUNCTION handle_featured_post()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a post as featured, unset all others
    IF NEW.is_featured = true THEN
        UPDATE posts 
        SET is_featured = false 
        WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to manage featured posts
DROP TRIGGER IF EXISTS manage_featured_posts ON posts;
CREATE TRIGGER manage_featured_posts
    BEFORE INSERT OR UPDATE OF is_featured
    ON posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_featured_post();
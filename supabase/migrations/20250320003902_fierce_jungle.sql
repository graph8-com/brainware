/*
  # Add feature flag functionality
  
  1. Changes
    - Add is_featured column to posts table
    - Add featured_image_large column for hero images
    - Add index for better performance
    - Add trigger to ensure only one featured post at a time
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add feature flag columns
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_image_large text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_is_featured 
ON posts (is_featured) 
WHERE is_featured = true;

-- Create function to handle featured post updates
CREATE OR REPLACE FUNCTION handle_featured_post()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a post as featured, unset all others
    IF NEW.is_featured = true THEN
        UPDATE posts 
        SET is_featured = false 
        WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND is_featured = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for INSERT and UPDATE
DROP TRIGGER IF EXISTS manage_featured_posts_insert ON posts;
DROP TRIGGER IF EXISTS manage_featured_posts_update ON posts;

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
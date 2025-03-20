/*
  # Fix featured posts functionality

  1. Changes
    - Add function to check currently featured post
    - Improve trigger logic for featured post handling
    - Add function to get featured post title

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing triggers and function
DROP TRIGGER IF EXISTS manage_featured_posts_insert ON posts;
DROP TRIGGER IF EXISTS manage_featured_posts_update ON posts;
DROP FUNCTION IF EXISTS handle_featured_post();
DROP FUNCTION IF EXISTS get_featured_post_title();

-- Create function to get featured post title
CREATE OR REPLACE FUNCTION get_featured_post_title()
RETURNS TEXT AS $$
DECLARE
    featured_title TEXT;
BEGIN
    SELECT title INTO featured_title
    FROM posts
    WHERE is_featured = true
    LIMIT 1;
    
    RETURN featured_title;
END;
$$ LANGUAGE plpgsql;

-- Create improved function to handle featured post updates
CREATE OR REPLACE FUNCTION handle_featured_post()
RETURNS TRIGGER AS $$
DECLARE
    current_featured_title TEXT;
BEGIN
    -- Only proceed if we're setting a post as featured
    IF NEW.is_featured = true THEN
        -- Get currently featured post title
        SELECT title INTO current_featured_title
        FROM posts
        WHERE is_featured = true AND id != NEW.id
        LIMIT 1;
        
        -- If there's already a featured post, raise an exception with the title
        IF current_featured_title IS NOT NULL THEN
            RAISE EXCEPTION 'Featured post already exists: %', current_featured_title;
        END IF;
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
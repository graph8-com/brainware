/*
  # Add featured post functionality

  1. Changes
    - Add is_featured column to posts table
    - Add featured_image_large column for featured post hero images
    - Update existing posts to have featured flag set to false

  2. Security
    - Maintain existing RLS policies
*/

-- Add is_featured column
ALTER TABLE posts 
ADD COLUMN is_featured boolean DEFAULT false;

-- Add featured_image_large column
ALTER TABLE posts
ADD COLUMN featured_image_large text;

-- Set all existing posts to not featured
UPDATE posts SET is_featured = false;
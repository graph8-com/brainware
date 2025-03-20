/*
  # Add category relationship to posts table

  1. Changes
    - Add category_id column to posts table
    - Add foreign key constraint to categories table
    - Update existing post with category

  2. Security
    - Maintain existing RLS policies
*/

-- Add category_id column to posts table
ALTER TABLE posts 
ADD COLUMN category_id uuid REFERENCES categories(id);

-- Update the existing AI post with its category
WITH ai_category AS (
  SELECT id FROM categories WHERE slug = 'ai-technology' LIMIT 1
)
UPDATE posts 
SET category_id = (SELECT id FROM ai_category)
WHERE slug = 'future-of-ai-in-business';
/*
  # Add image upload functionality (with existence check)
  
  1. Storage Configuration
    - Check if 'blog-images' bucket exists before creating
    - Set 5MB file size limit
    - Allow only image file types (png, jpeg, gif, webp)
  
  2. Security
    - Enable RLS on storage.objects
    - Add policies for:
      - Authenticated users can upload images
      - Authenticated users can update their images
      - Authenticated users can delete their images
      - Public read access for all images
*/

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'blog-images'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'blog-images',
            'blog-images',
            true,
            5000000, -- 5MB in bytes
            ARRAY[
                'image/png',
                'image/jpeg',
                'image/gif',
                'image/webp'
            ]
        );
    END IF;
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for blog images" ON storage.objects;

-- Create new policies
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'blog-images'
);

CREATE POLICY "Authenticated users can update their images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can delete their images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'blog-images');

CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'blog-images');
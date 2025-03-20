/*
  # Set up storage for blog images

  1. Storage Setup
    - Create a bucket for blog images
    - Add policies for authenticated users to upload/manage images
    - Add policy for public read access

  2. Security
    - Only authenticated users can upload/delete images
    - Public read access for all images
    - File size limit of 5MB
    - Only allow image file types
*/

-- Create storage bucket
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

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
);

-- Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update their images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to delete their images
CREATE POLICY "Authenticated users can delete their images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'blog-images');

-- Allow public read access to all images
CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'blog-images');
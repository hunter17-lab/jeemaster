-- coaching-media is a private bucket holding only series logos. Signed/public display
-- requires a read grant; scope it to this bucket only (logos are public brand images).
CREATE POLICY "coaching-media read logos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'coaching-media');
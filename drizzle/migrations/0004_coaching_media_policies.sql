-- Coaching series logos live in their own public bucket (created via storage tooling).
-- Admins manage uploads; public display uses the bucket's public URL.

CREATE POLICY "coaching-media admin manage"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'coaching-media'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'coaching-media'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Tighten the giveaway-media public read: restrict it to anon/authenticated client roles and
-- keep it scoped to specific public rows only — a giveaway's referenced prize image or an
-- approved, still-visible winner proof. It can never expose every object in the bucket.
DROP POLICY IF EXISTS "giveaway-media read public giveaway content" ON storage.objects;
CREATE POLICY "giveaway-media read public giveaway content"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'giveaway-media'
  AND (
    EXISTS (
      SELECT 1 FROM public.giveaway_proofs p
      WHERE p.image_url = objects.name
        AND p.status = 'approved'
        AND (p.visible_until IS NULL OR p.visible_until > now())
    )
    OR (
      (storage.foldername(name))[2] = 'prizes'
      AND EXISTS (SELECT 1 FROM public.giveaways g WHERE g.image_url = objects.name)
    )
  )
);
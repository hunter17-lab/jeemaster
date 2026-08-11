-- 1) Restrict public prize-image reads to the prizes/ folder only
DROP POLICY IF EXISTS "giveaway-media read approved or owned" ON storage.objects;
CREATE POLICY "giveaway-media read approved or owned"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'giveaway-media'
  AND (
    (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
    OR owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.giveaway_proofs p
      WHERE p.image_url = objects.name
        AND p.status = 'approved'
        AND (p.visible_until IS NULL OR p.visible_until > now())
    )
    OR (
      (storage.foldername(objects.name))[2] = 'prizes'
      AND EXISTS (SELECT 1 FROM public.giveaways g WHERE g.image_url = objects.name)
    )
  )
);

-- 2) Revoke direct API access to unused SECURITY DEFINER helpers
REVOKE ALL ON FUNCTION public.get_giveaway_winners(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.giveaway_entry_count(uuid) FROM anon, authenticated;

-- 3) Winner picking requires a signed-in user
REVOKE ALL ON FUNCTION public.pick_giveaway_winners(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.pick_giveaway_winner(uuid) FROM anon, authenticated;
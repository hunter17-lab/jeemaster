-- 1. Public views replacing publicly-executable SECURITY DEFINER functions
CREATE OR REPLACE VIEW public.giveaway_public_winners AS
  SELECT w.giveaway_id, e.name AS winner_name, w.win_position
  FROM public.giveaway_winners w
  JOIN public.giveaway_entries e ON e.id = w.entry_id;

CREATE OR REPLACE VIEW public.giveaway_entry_counts AS
  SELECT giveaway_id, count(*)::int AS entry_count
  FROM public.giveaway_entries
  GROUP BY giveaway_id;

GRANT SELECT ON public.giveaway_public_winners TO anon, authenticated;
GRANT SELECT ON public.giveaway_entry_counts TO anon, authenticated;

-- 2. Revoke direct execution of SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.get_giveaway_winners(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.giveaway_entry_count(uuid) FROM anon, authenticated, PUBLIC;

-- 3. giveaway_winners: no longer publicly readable (entry_id correlation)
DROP POLICY IF EXISTS "anyone can view winners" ON public.giveaway_winners;
REVOKE SELECT ON public.giveaway_winners FROM anon;
CREATE POLICY "users view own win or admin" ON public.giveaway_winners
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.giveaway_entries e
      WHERE e.id = giveaway_winners.entry_id AND e.user_id = auth.uid()
    )
  );

-- 4. Avatars bucket: owner-only reads
DROP POLICY IF EXISTS "avatars_user_read" ON storage.objects;
CREATE POLICY "avatars_owner_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      (storage.foldername(name))[1] = (auth.uid())::text
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );
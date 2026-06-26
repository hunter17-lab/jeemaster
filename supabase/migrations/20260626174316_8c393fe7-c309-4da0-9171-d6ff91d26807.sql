
-- Fix: banned_emails publicly readable
DROP POLICY IF EXISTS "Anyone can check bans" ON public.banned_emails;

-- Fix: giveaway_proofs INSERT must verify winner
DROP POLICY IF EXISTS "winner submits proof" ON public.giveaway_proofs;
CREATE POLICY "winner submits proof" ON public.giveaway_proofs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.giveaway_winners w
      JOIN public.giveaway_entries e ON e.id = w.entry_id
      WHERE w.giveaway_id = giveaway_proofs.giveaway_id
        AND w.entry_id = giveaway_proofs.winner_entry_id
        AND e.user_id = auth.uid()
    )
  );

-- Fix: storage SELECT too broad on private bucket
DROP POLICY IF EXISTS "giveaway-media public read" ON storage.objects;

CREATE POLICY "giveaway-media read approved or owned"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'giveaway-media'
    AND (
      -- Admins
      (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::public.app_role))
      -- File owner
      OR owner = auth.uid()
      -- Approved proof image (publicly visible, possibly time-limited)
      OR EXISTS (
        SELECT 1 FROM public.giveaway_proofs p
        WHERE p.image_url = storage.objects.name
          AND p.status = 'approved'
          AND (p.visible_until IS NULL OR p.visible_until > now())
      )
      -- Giveaway prize images (public on giveaway pages)
      OR EXISTS (
        SELECT 1 FROM public.giveaways g
        WHERE g.image_url = storage.objects.name
      )
    )
  );

-- Fix: SECURITY DEFINER trigger-only functions should not be RPC-callable
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_pin_limit() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM anon, authenticated, public;

-- Lock down winner-pick RPCs to authenticated only (admins gate inside function)
REVOKE EXECUTE ON FUNCTION public.pick_giveaway_winner(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.pick_giveaway_winners(uuid) FROM anon, public;

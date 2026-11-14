DROP POLICY IF EXISTS "Anyone can view giveaways" ON public.giveaways;
CREATE POLICY "Anyone can view giveaways" ON public.giveaways
FOR SELECT TO anon, authenticated
USING (status IN ('active', 'ended'));

DROP POLICY IF EXISTS "anyone can read public winners" ON public.giveaway_public_winners;
CREATE POLICY "anyone can read public winners" ON public.giveaway_public_winners
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.giveaways g
    WHERE g.id = giveaway_public_winners.giveaway_id
      AND g.status IN ('active', 'ended')
  )
);
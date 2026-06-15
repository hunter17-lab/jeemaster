
ALTER TABLE public.giveaways
  ADD COLUMN IF NOT EXISTS winner_count INT NOT NULL DEFAULT 1 CHECK (winner_count BETWEEN 1 AND 50),
  ADD COLUMN IF NOT EXISTS celebration_seen BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.giveaway_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.giveaway_entries(id) ON DELETE CASCADE,
  win_position INT NOT NULL DEFAULT 1,
  picked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(giveaway_id, entry_id)
);

GRANT SELECT ON public.giveaway_winners TO anon, authenticated;
GRANT ALL ON public.giveaway_winners TO service_role;
ALTER TABLE public.giveaway_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view winners" ON public.giveaway_winners FOR SELECT USING (true);
CREATE POLICY "admins manage winners" ON public.giveaway_winners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.giveaway_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  winner_entry_id UUID NOT NULL REFERENCES public.giveaway_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  visible_until TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.giveaway_proofs TO authenticated;
GRANT SELECT ON public.giveaway_proofs TO anon;
GRANT ALL ON public.giveaway_proofs TO service_role;
ALTER TABLE public.giveaway_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view approved proofs publicly" ON public.giveaway_proofs FOR SELECT
  USING (status = 'approved' AND (visible_until IS NULL OR visible_until > now()));
CREATE POLICY "winner sees own proof" ON public.giveaway_proofs FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "winner submits proof" ON public.giveaway_proofs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins update proofs" ON public.giveaway_proofs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete proofs" ON public.giveaway_proofs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_giveaway_proofs_updated BEFORE UPDATE ON public.giveaway_proofs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX IF NOT EXISTS giveaway_entries_user_unique
  ON public.giveaway_entries (giveaway_id, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS giveaway_entries_email_unique
  ON public.giveaway_entries (giveaway_id, lower(email));

DROP POLICY IF EXISTS "users update own entry before result" ON public.giveaway_entries;
DROP POLICY IF EXISTS "users delete own entry before result" ON public.giveaway_entries;
CREATE POLICY "users update own entry before result" ON public.giveaway_entries
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.giveaways g WHERE g.id = giveaway_id AND g.result_at > now() AND g.winner_entry_id IS NULL))
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own entry before result" ON public.giveaway_entries
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.giveaways g WHERE g.id = giveaway_id AND g.result_at > now() AND g.winner_entry_id IS NULL));

CREATE OR REPLACE FUNCTION public.pick_giveaway_winners(_giveaway_id uuid)
RETURNS SETOF uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _auto boolean;
  _result_at timestamptz;
  _count int;
  _existing int;
  _entry record;
  _pos int := 1;
BEGIN
  SELECT auto_pick, result_at, winner_count INTO _auto, _result_at, _count
    FROM public.giveaways WHERE id = _giveaway_id;
  SELECT count(*) INTO _existing FROM public.giveaway_winners WHERE giveaway_id = _giveaway_id;
  IF _existing > 0 THEN
    RETURN QUERY SELECT entry_id FROM public.giveaway_winners WHERE giveaway_id = _giveaway_id ORDER BY win_position;
    RETURN;
  END IF;

  SELECT has_role(auth.uid(), 'admin') INTO _is_admin;
  IF NOT _is_admin AND (NOT _auto OR _result_at > now()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  FOR _entry IN
    SELECT id FROM public.giveaway_entries
    WHERE giveaway_id = _giveaway_id
    ORDER BY random()
    LIMIT _count
  LOOP
    INSERT INTO public.giveaway_winners(giveaway_id, entry_id, win_position)
    VALUES (_giveaway_id, _entry.id, _pos);
    RETURN NEXT _entry.id;
    _pos := _pos + 1;
  END LOOP;

  IF _pos = 1 THEN RAISE EXCEPTION 'No entries'; END IF;

  UPDATE public.giveaways
    SET winner_entry_id = (SELECT entry_id FROM public.giveaway_winners WHERE giveaway_id = _giveaway_id ORDER BY win_position LIMIT 1),
        winner_picked_at = now(),
        status = 'ended'
    WHERE id = _giveaway_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_giveaway_winners(_giveaway_id uuid)
RETURNS TABLE(entry_id uuid, winner_name text, win_position int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.entry_id, e.name, w.win_position
  FROM public.giveaway_winners w
  JOIN public.giveaway_entries e ON e.id = w.entry_id
  WHERE w.giveaway_id = _giveaway_id
  ORDER BY w.win_position;
$$;

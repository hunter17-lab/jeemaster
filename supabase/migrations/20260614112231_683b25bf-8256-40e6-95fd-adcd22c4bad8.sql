
CREATE TABLE public.giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  prize text NOT NULL,
  image_url text,
  result_at timestamptz NOT NULL,
  auto_pick boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  winner_entry_id uuid,
  winner_picked_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.giveaways TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.giveaways TO authenticated;
GRANT ALL ON public.giveaways TO service_role;

ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view giveaways" ON public.giveaways FOR SELECT USING (true);
CREATE POLICY "Admins insert giveaways" ON public.giveaways FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update giveaways" ON public.giveaways FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete giveaways" ON public.giveaways FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_giveaways_updated_at BEFORE UPDATE ON public.giveaways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.giveaway_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (giveaway_id, user_id)
);

GRANT SELECT, INSERT ON public.giveaway_entries TO authenticated;
GRANT ALL ON public.giveaway_entries TO service_role;

ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own entries" ON public.giveaway_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own entries" ON public.giveaway_entries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all entries" ON public.giveaway_entries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete entries" ON public.giveaway_entries FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_entries_giveaway ON public.giveaway_entries(giveaway_id);

-- Public counter function (avoids leaking emails)
CREATE OR REPLACE FUNCTION public.giveaway_entry_count(_giveaway_id uuid)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COUNT(*)::int FROM public.giveaway_entries WHERE giveaway_id = _giveaway_id $$;

GRANT EXECUTE ON FUNCTION public.giveaway_entry_count(uuid) TO anon, authenticated;

-- Winner picker (admin only or auto)
CREATE OR REPLACE FUNCTION public.pick_giveaway_winner(_giveaway_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _winner uuid;
  _is_admin boolean;
  _auto boolean;
  _result_at timestamptz;
  _existing uuid;
BEGIN
  SELECT auto_pick, result_at, winner_entry_id INTO _auto, _result_at, _existing
    FROM public.giveaways WHERE id = _giveaway_id;
  IF _existing IS NOT NULL THEN RETURN _existing; END IF;

  SELECT has_role(auth.uid(), 'admin') INTO _is_admin;
  IF NOT _is_admin AND (NOT _auto OR _result_at > now()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT id INTO _winner FROM public.giveaway_entries
    WHERE giveaway_id = _giveaway_id ORDER BY random() LIMIT 1;
  IF _winner IS NULL THEN RAISE EXCEPTION 'No entries'; END IF;

  UPDATE public.giveaways
    SET winner_entry_id = _winner, winner_picked_at = now(), status = 'ended'
    WHERE id = _giveaway_id;
  RETURN _winner;
END;
$$;

GRANT EXECUTE ON FUNCTION public.pick_giveaway_winner(uuid) TO anon, authenticated;

DROP VIEW IF EXISTS public.giveaway_public_winners;
DROP VIEW IF EXISTS public.giveaway_entry_counts;

-- Public, non-sensitive winner display data
CREATE TABLE public.giveaway_public_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  winner_entry_ref uuid,
  winner_name text NOT NULL,
  win_position integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.giveaway_public_winners TO anon, authenticated;
GRANT ALL ON public.giveaway_public_winners TO service_role;
ALTER TABLE public.giveaway_public_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read public winners" ON public.giveaway_public_winners
  FOR SELECT USING (true);
CREATE POLICY "admins manage public winners" ON public.giveaway_public_winners
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.sync_public_winner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.giveaway_public_winners WHERE winner_entry_ref = OLD.entry_id AND giveaway_id = OLD.giveaway_id;
    RETURN OLD;
  END IF;
  INSERT INTO public.giveaway_public_winners (giveaway_id, winner_entry_ref, winner_name, win_position)
  SELECT NEW.giveaway_id, NEW.entry_id, e.name, NEW.win_position
  FROM public.giveaway_entries e WHERE e.id = NEW.entry_id;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.sync_public_winner() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_sync_public_winner
AFTER INSERT OR DELETE ON public.giveaway_winners
FOR EACH ROW EXECUTE FUNCTION public.sync_public_winner();

-- Backfill existing winners
INSERT INTO public.giveaway_public_winners (giveaway_id, winner_entry_ref, winner_name, win_position)
SELECT w.giveaway_id, w.entry_id, e.name, w.win_position
FROM public.giveaway_winners w JOIN public.giveaway_entries e ON e.id = w.entry_id;

-- Public entry count on giveaways
ALTER TABLE public.giveaways ADD COLUMN IF NOT EXISTS entry_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.sync_giveaway_entry_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _gid uuid := COALESCE(NEW.giveaway_id, OLD.giveaway_id);
BEGIN
  UPDATE public.giveaways g
  SET entry_count = (SELECT count(*) FROM public.giveaway_entries e WHERE e.giveaway_id = _gid)
  WHERE g.id = _gid;
  RETURN COALESCE(NEW, OLD);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.sync_giveaway_entry_count() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_sync_giveaway_entry_count
AFTER INSERT OR DELETE ON public.giveaway_entries
FOR EACH ROW EXECUTE FUNCTION public.sync_giveaway_entry_count();

UPDATE public.giveaways g
SET entry_count = (SELECT count(*) FROM public.giveaway_entries e WHERE e.giveaway_id = g.id);
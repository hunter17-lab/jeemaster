ALTER TABLE public.content_items 
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pinned_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_content_items_pinned ON public.content_items (pinned, pinned_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_pin_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  pin_count integer;
BEGIN
  IF NEW.pinned = true AND (OLD.pinned IS DISTINCT FROM true) THEN
    SELECT COUNT(*) INTO pin_count FROM public.content_items WHERE pinned = true;
    IF pin_count >= 10 THEN
      RAISE EXCEPTION 'Pin limit reached: maximum 10 pinned resources allowed';
    END IF;
    NEW.pinned_at = now();
  ELSIF NEW.pinned = false THEN
    NEW.pinned_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_pin_limit ON public.content_items;
CREATE TRIGGER trg_enforce_pin_limit
BEFORE UPDATE ON public.content_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_pin_limit();
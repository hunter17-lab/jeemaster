DROP POLICY IF EXISTS "anyone can register a visit" ON public.site_visitors;
DROP POLICY IF EXISTS "anyone can refresh activity" ON public.site_visitors;
REVOKE INSERT, UPDATE ON public.site_visitors FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_visit(_visitor_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _visitor_id IS NULL OR length(_visitor_id) < 8 OR length(_visitor_id) > 64 THEN
    RETURN;
  END IF;
  INSERT INTO public.site_visitors (visitor_id, first_seen_at, last_seen_at)
  VALUES (_visitor_id, now(), now())
  ON CONFLICT (visitor_id) DO UPDATE SET last_seen_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.track_visit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_visit(text) TO anon, authenticated, service_role;
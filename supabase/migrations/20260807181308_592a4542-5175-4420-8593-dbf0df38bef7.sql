CREATE TABLE public.site_visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL UNIQUE,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.site_visitors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.site_visitors TO anon;
GRANT ALL ON public.site_visitors TO service_role;

ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can register a visit" ON public.site_visitors
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anyone can refresh activity" ON public.site_visitors
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admins view visitors" ON public.site_visitors
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_visitors_updated_at BEFORE UPDATE ON public.site_visitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_site_visitors_first_seen ON public.site_visitors (first_seen_at);
CREATE INDEX idx_site_visitors_last_seen ON public.site_visitors (last_seen_at);
-- Coaching Test Series (admin-managed)
CREATE TABLE public.coaching_test_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_path text,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.coaching_series_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.coaching_test_series(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Saved AI/PYQ mock test attempts (CBT results)
CREATE TABLE public.mock_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  source text NOT NULL DEFAULT 'ai',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  score numeric NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  unattempted_count integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mock_attempts_user_created_idx ON public.mock_attempts (user_id, created_at DESC);
CREATE INDEX coaching_series_tests_series_idx ON public.coaching_series_tests (series_id, sort_order);

-- Grants (Data API)
GRANT SELECT ON public.coaching_test_series TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaching_test_series TO authenticated;
GRANT ALL ON public.coaching_test_series TO service_role;
GRANT SELECT ON public.coaching_series_tests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaching_series_tests TO authenticated;
GRANT ALL ON public.coaching_series_tests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_attempts TO authenticated;
GRANT ALL ON public.mock_attempts TO service_role;

ALTER TABLE public.coaching_test_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_series_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view series" ON public.coaching_test_series FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage series" ON public.coaching_test_series FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view series tests" ON public.coaching_series_tests FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage series tests" ON public.coaching_series_tests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users manage own attempts" ON public.mock_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER coaching_test_series_updated_at BEFORE UPDATE ON public.coaching_test_series FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER coaching_series_tests_updated_at BEFORE UPDATE ON public.coaching_series_tests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
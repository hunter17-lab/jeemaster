DROP POLICY IF EXISTS "anyone authed reads ai settings" ON public.ai_settings;

CREATE OR REPLACE FUNCTION public.get_ai_client_settings()
RETURNS TABLE(enabled boolean, maintenance boolean, max_file_mb integer, allowed_types text[], daily_limit integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s.enabled, s.maintenance, s.max_file_mb, s.allowed_types, s.daily_limit
  FROM public.ai_settings s WHERE s.id = 1
$$;

REVOKE ALL ON FUNCTION public.get_ai_client_settings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_ai_client_settings() TO authenticated, service_role;
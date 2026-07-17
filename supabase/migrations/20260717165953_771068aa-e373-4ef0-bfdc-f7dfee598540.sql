-- Revoke public EXECUTE on trigger-only SECURITY DEFINER functions
-- These are called by triggers (which run as the function owner) and never need direct API access.
REVOKE EXECUTE ON FUNCTION public.enforce_pin_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies (runs as definer regardless), no need to expose it via the API
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Giveaway helpers: allow only authenticated users (anon shouldn't call them directly)
REVOKE EXECUTE ON FUNCTION public.giveaway_entry_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_giveaway_winners(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.pick_giveaway_winner(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pick_giveaway_winners(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.giveaway_entry_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_giveaway_winners(uuid) TO authenticated;
-- pick_* remains callable via service_role only (edge functions / admin)
GRANT EXECUTE ON FUNCTION public.pick_giveaway_winner(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.pick_giveaway_winners(uuid) TO service_role;
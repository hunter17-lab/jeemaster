GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.pick_giveaway_winners(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.giveaway_entry_count(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_giveaway_winners(uuid) TO authenticated, anon;
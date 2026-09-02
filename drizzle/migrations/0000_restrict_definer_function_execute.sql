-- has_role is only needed inside RLS policies for signed-in users; anon never needs to call it.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- Winner lookup helpers should not be callable by anonymous visitors.
REVOKE EXECUTE ON FUNCTION public.get_giveaway_winners(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.giveaway_entry_count(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.pick_giveaway_winner(uuid) FROM anon, authenticated, public;

-- track_visit must stay callable by anonymous visitors for analytics; it validates its input and only upserts a random visitor id.

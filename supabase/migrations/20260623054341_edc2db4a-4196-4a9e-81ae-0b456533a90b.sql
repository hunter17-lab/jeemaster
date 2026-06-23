ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coaching_institute text,
  ADD COLUMN IF NOT EXISTS state text;
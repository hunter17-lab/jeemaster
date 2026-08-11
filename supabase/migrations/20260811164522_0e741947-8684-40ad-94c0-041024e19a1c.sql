CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.banned_emails b
    WHERE lower(b.email) = lower(NEW.email)
  ) THEN
    RAISE EXCEPTION 'This email address is not allowed to register';
  END IF;

  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$function$;

CREATE INDEX IF NOT EXISTS banned_emails_email_lower_idx ON public.banned_emails (lower(email));
-- ─────────────────────────────────────────────────────────────────────────────
-- Starter stars migration
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Make sure stars column exists with default 20
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS stars int DEFAULT 20;

-- 2. Update default so future inserts start at 20
ALTER TABLE profiles
    ALTER COLUMN stars SET DEFAULT 20;

-- 3. Give existing users who have 0 stars the starter pack
-- (won't touch users who already have stars from playing)
UPDATE profiles
SET stars = 20
WHERE stars = 0 OR stars IS NULL;

-- 4. Update the handle_new_user trigger function to include stars = 20
-- This fires automatically when a new user confirms their email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
INSERT INTO public.profiles (id, username, display_name, stars)
VALUES (
           NEW.id,
           NEW.raw_user_meta_data->>'username',
           NEW.raw_user_meta_data->>'display_name',
           20  -- ← starter stars
       )
    ON CONFLICT (id) DO UPDATE
                            SET
                                username     = EXCLUDED.username,
                            display_name = EXCLUDED.display_name,
                            stars        = CASE
                            WHEN profiles.stars IS NULL OR profiles.stars = 0
                            THEN 20
                            ELSE profiles.stars  -- don't overwrite if they already have stars
END;

RETURN NEW;
END;
$$;

-- 5. Make sure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

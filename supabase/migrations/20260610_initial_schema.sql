-- Create custom types
CREATE TYPE public.game_type AS ENUM ('genshin', 'hsr', 'zzz', 'wuwa', 'nte', 'endfield');

-- Create users table
CREATE TABLE public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  display_name text,
  timezone text DEFAULT 'Asia/Jakarta',
  push_token text,
  created_at timestamptz DEFAULT now()
);

-- Create game_accounts table
CREATE TABLE public.game_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  game_type public.game_type NOT NULL,
  nickname text NOT NULL,
  current_resin integer NOT NULL DEFAULT 0,
  max_resin integer NOT NULL,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  secondary_resin integer,
  secondary_max integer,
  secondary_updated_at timestamptz,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create daily_tasks table
CREATE TABLE public.daily_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid REFERENCES public.game_accounts(id) ON DELETE CASCADE NOT NULL,
  task_key text NOT NULL,
  label text NOT NULL,
  is_done boolean DEFAULT false,
  date date NOT NULL
);

-- Create resin_history table
CREATE TABLE public.resin_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid REFERENCES public.game_accounts(id) ON DELETE CASCADE NOT NULL,
  snapshot_resin integer NOT NULL,
  snapshot_secondary integer,
  recorded_at timestamptz DEFAULT now()
);

-- Row Level Security (RLS)

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resin_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Game accounts policies
CREATE POLICY "Users can view their own game accounts"
  ON public.game_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game accounts"
  ON public.game_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game accounts"
  ON public.game_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game accounts"
  ON public.game_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Daily tasks policies
CREATE POLICY "Users can view their own tasks"
  ON public.daily_tasks FOR SELECT
  USING (account_id IN (SELECT id FROM public.game_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert tasks for their accounts"
  ON public.daily_tasks FOR INSERT
  WITH CHECK (account_id IN (SELECT id FROM public.game_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own tasks"
  ON public.daily_tasks FOR UPDATE
  USING (account_id IN (SELECT id FROM public.game_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own tasks"
  ON public.daily_tasks FOR DELETE
  USING (account_id IN (SELECT id FROM public.game_accounts WHERE user_id = auth.uid()));

-- Resin history policies
CREATE POLICY "Users can view their own resin history"
  ON public.resin_history FOR SELECT
  USING (account_id IN (SELECT id FROM public.game_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own resin history"
  ON public.resin_history FOR INSERT
  WITH CHECK (account_id IN (SELECT id FROM public.game_accounts WHERE user_id = auth.uid()));

-- Trigger to handle new users from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

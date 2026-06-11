-- supabase/migrations/20260611000000_add_user_roster.sql

CREATE TABLE user_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES game_accounts(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  owned BOOL NOT NULL DEFAULT TRUE,
  constellation INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, character_id)
);

-- RLS
ALTER TABLE user_roster ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roster"
ON user_roster FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM game_accounts
    WHERE game_accounts.id = user_roster.account_id
    AND game_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own roster"
ON user_roster FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM game_accounts
    WHERE game_accounts.id = user_roster.account_id
    AND game_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own roster"
ON user_roster FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM game_accounts
    WHERE game_accounts.id = user_roster.account_id
    AND game_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own roster"
ON user_roster FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM game_accounts
    WHERE game_accounts.id = user_roster.account_id
    AND game_accounts.user_id = auth.uid()
  )
);

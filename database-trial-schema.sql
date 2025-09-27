-- Add trial and preferred plan fields to users table
-- This script adds the necessary columns for the trial system

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Create index for trial queries
CREATE INDEX IF NOT EXISTS idx_users_trial_status ON users(subscription_status, trial_ends_at);

-- Update existing users to have trial status if they don't have a subscription_status
UPDATE users 
SET subscription_status = 'active' 
WHERE subscription_status IS NULL 
AND subscription_tier != 'free';

-- Set trial status for free tier users
UPDATE users 
SET subscription_status = 'trial',
    trial_ends_at = created_at + INTERVAL '14 days'
WHERE subscription_tier = 'free' 
AND subscription_status IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.preferred_plan IS 'The subscription plan the user intended to upgrade to during signup';
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status: trial, active, cancelled, expired';
COMMENT ON COLUMN users.trial_ends_at IS 'When the free trial expires';

-- Create a function to check if a user is on trial
CREATE OR REPLACE FUNCTION is_user_on_trial(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND subscription_status = 'trial' 
    AND trial_ends_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get trial days remaining
CREATE OR REPLACE FUNCTION get_trial_days_remaining(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  days_remaining INTEGER;
BEGIN
  SELECT EXTRACT(DAY FROM (trial_ends_at - NOW()))::INTEGER
  INTO days_remaining
  FROM users 
  WHERE id = user_id 
  AND subscription_status = 'trial';
  
  RETURN COALESCE(days_remaining, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

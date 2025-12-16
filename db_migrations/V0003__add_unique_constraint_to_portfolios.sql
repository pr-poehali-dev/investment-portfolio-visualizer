-- Add unique constraint to prevent duplicate positions
ALTER TABLE portfolios ADD CONSTRAINT unique_user_ticker UNIQUE (user_id, ticker);

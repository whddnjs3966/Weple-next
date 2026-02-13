-- Add actual_cost and category columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS actual_cost integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS category text;

-- Add check constraint for category (optional, but good for consistency)
-- ALTER TABLE public.tasks ADD CONSTRAINT check_category CHECK (category IN ('venue', 'sdm', 'honeymoon', 'gifts', 'other'));

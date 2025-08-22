-- Add invitation tracking to authorized_emails table
ALTER TABLE public.authorized_emails 
ADD COLUMN invitation_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN invitation_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN has_account BOOLEAN DEFAULT FALSE;
-- Enable RLS on the leads_with_sources view
ALTER VIEW leads_with_sources SET (security_barrier = true);

-- Add RLS policies to leads_with_sources view to match the leads table security
CREATE POLICY "Users can view their own leads with sources" 
ON leads_with_sources 
FOR SELECT 
USING (auth.uid() = user_id);
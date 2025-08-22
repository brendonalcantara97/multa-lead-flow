-- Enable Row Level Security on the leads_with_sources view
ALTER TABLE leads_with_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads_with_sources that mirror the leads table policies
-- Users can only view their own leads
CREATE POLICY "Users can view their own leads with sources" 
ON leads_with_sources 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own leads (though this is typically done through the leads table)
CREATE POLICY "Users can insert their own leads with sources" 
ON leads_with_sources 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own leads
CREATE POLICY "Users can update their own leads with sources" 
ON leads_with_sources 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own leads
CREATE POLICY "Users can delete their own leads with sources" 
ON leads_with_sources 
FOR DELETE 
USING (auth.uid() = user_id);
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface LeadFromDB {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone: string;
  violation_type: string;
  status: string;
  amount?: number;
  conversion_date?: string;
  payment_method?: string;
  cnh_at_risk?: boolean;
  appealed_before?: boolean;
  urgency?: string;
  last_moved_at?: string;
  observations?: string;
  rejection_reason?: string;
  documents?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  // From view - source data
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  fbp?: string;
  fbclid?: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<LeadFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const fetchLeads = async () => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads_with_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar leads: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    if (!user) return;

    try {
      const updates: any = {
        status: newStatus,
        last_moved_at: new Date().toISOString(),
      };

      // Se movendo para Cliente, definir data de conversão
      if (newStatus === 'cliente') {
        updates.conversion_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, ...updates } 
          : lead
      ));

      toast.success(`Lead movido para ${newStatus}!`);
      return { success: true };
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
      return { error };
    }
  };

  const updateLead = async (leadId: string, updates: any) => {
    if (!user) return;

    try {
      // Clean updates to match database schema
      const cleanUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Remove any undefined values and cast types properly
      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key];
        }
      });

      const { error } = await supabase
        .from('leads')
        .update(cleanUpdates)
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, ...updates, updated_at: new Date().toISOString() } 
          : lead
      ));

      toast.success('Lead atualizado com sucesso!');
      return { success: true };
    } catch (error: any) {
      toast.error('Erro ao atualizar lead: ' + error.message);
      return { error };
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  return {
    leads,
    loading,
    fetchLeads,
    updateLeadStatus,
    updateLead,
  };
};
export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  violationType: string;
  status: string;
  createdAt: string;
  observations?: string;
  amount?: number;
  conversionDate?: string;
  paymentMethod?: string;
  rejectionReason?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  fbp?: string;
  fbclid?: string;
  documents?: string[];
  tags?: string[];
  cnhAtRisk?: boolean;
  appealedBefore?: boolean;
  urgency?: 'Alta' | 'Média' | 'Baixa';
  lastMovedAt?: string;
}

// Interface for compatibility with Supabase schema
export interface LeadDB {
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
  // Source tracking
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

import { UserPlus, Trash2, Mail, Shield, UserCheck, Clock, DollarSign, AlertCircle } from "lucide-react";

export const CRM_COLUMNS = [
  { 
    id: 'novo-lead', 
    title: 'Novo Lead', 
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Clock
  },
  { 
    id: 'contato-realizado', 
    title: 'Contato Realizado', 
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: UserPlus
  },
  { 
    id: 'documentos-recebidos', 
    title: 'Documentos Recebidos', 
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: Mail
  },
  { 
    id: 'contrato-assinado', 
    title: 'Contrato Assinado', 
    color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    icon: Shield
  },
  { 
    id: 'cliente', 
    title: 'Cliente', 
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: UserCheck
  },
  { 
    id: 'nao-cliente', 
    title: 'Não Cliente', 
    color: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: AlertCircle
  }
];

// Helper function to convert between frontend and database format
export const convertLeadFromDB = (dbLead: LeadDB): Lead => ({
  id: dbLead.id,
  name: dbLead.name,
  email: dbLead.email,
  phone: dbLead.phone,
  violationType: dbLead.violation_type,
  status: dbLead.status,
  createdAt: dbLead.created_at || '',
  observations: dbLead.observations,
  amount: dbLead.amount,
  conversionDate: dbLead.conversion_date,
  paymentMethod: dbLead.payment_method,
  rejectionReason: dbLead.rejection_reason,
  utm_source: dbLead.utm_source,
  utm_medium: dbLead.utm_medium,
  utm_campaign: dbLead.utm_campaign,
  utm_term: dbLead.utm_term,
  utm_content: dbLead.utm_content,
  gclid: dbLead.gclid,
  gbraid: dbLead.gbraid,
  fbp: dbLead.fbp,
  fbclid: dbLead.fbclid,
  documents: dbLead.documents || [],
  tags: dbLead.tags,
  cnhAtRisk: dbLead.cnh_at_risk,
  appealedBefore: dbLead.appealed_before,
  urgency: dbLead.urgency as 'Alta' | 'Média' | 'Baixa',
  lastMovedAt: dbLead.last_moved_at,
});
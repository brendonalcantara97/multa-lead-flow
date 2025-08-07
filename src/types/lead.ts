export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  violationType: string;
  status: string;
  createdAt: string;
  observations: string;
  amount: number;
  conversionDate?: string;
  paymentMethod?: string;
  rejectionReason?: string; // Para quando mover para "Não Cliente"
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  fbp?: string;
  documents: string[];
  // Novos campos
  tags?: string[];
  cnhAtRisk?: boolean;
  appealedBefore?: boolean;
  urgency?: 'Alta' | 'Média' | 'Baixa';
  lastMovedAt?: string; // para gatilhos de estagnação
}

export const CRM_COLUMNS = [
  { 
    id: 'Novo Lead', 
    title: 'Novo Lead', 
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    textColor: 'text-blue-700'
  },
  { 
    id: 'Contato Realizado', 
    title: 'Contato Realizado', 
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
    textColor: 'text-orange-700'
  },
  { 
    id: 'Documentos Recebidos', 
    title: 'Documentos Recebidos', 
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    textColor: 'text-purple-700'
  },
  { 
    id: 'Contrato Assinado', 
    title: 'Contrato Assinado', 
    color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
    textColor: 'text-yellow-700'
  },
  { 
    id: 'Cliente', 
    title: 'Cliente', 
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    textColor: 'text-green-700'
  },
  { 
    id: 'Não Cliente', 
    title: 'Não Cliente', 
    color: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    textColor: 'text-gray-700'
  }
];
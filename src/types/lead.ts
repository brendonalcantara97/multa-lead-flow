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
}

export const CRM_COLUMNS = [
  { 
    id: 'Novo Lead', 
    title: 'Novo Lead', 
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    textColor: 'text-blue-700'
  },
  { 
    id: 'Em Negociação', 
    title: 'Em Negociação', 
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
    textColor: 'text-orange-700'
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
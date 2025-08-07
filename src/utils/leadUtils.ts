export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const getViolationTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    'excesso-velocidade': 'Excesso de Velocidade',
    'lei-seca': 'Lei Seca',
    'cnh-suspensa': 'CNH Suspensa',
    'avanco-sinal': 'Avanço de Sinal',
    'bafometro': 'Bafômetro',
    'suspensao': 'Suspensão',
    'cassacao': 'Cassação',
    'multas': 'Multas Gerais',
    'outras': 'Outras'
  };
  return types[type] || type;
};

export const getViolationIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    'excesso-velocidade': '🚗',
    'lei-seca': '🚫🍺',
    'cnh-suspensa': '🪪',
    'avanco-sinal': '🚦',
    'bafometro': '🍺',
    'suspensao': '⚠️',
    'cassacao': '❌',
    'multas': '📋',
    'outras': '📄'
  };
  return icons[type] || '📄';
};

export const getDaysFromDate = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDaysInCurrentStatus = (lead: any): number => {
  // Preferir a última movimentação se existir
  return getDaysFromDate(lead.lastMovedAt || lead.createdAt);
};

export const getSourceIcon = (source?: string) => {
  if (!source) return null;
  
  const icons: { [key: string]: string } = {
    'google': '🔍',
    'facebook': '📘',
    'instagram': '📷',
    'whatsapp': '💬',
    'direct': '🔗',
    'organic': '🌱'
  };
  
  return icons[source.toLowerCase()] || '🌐';
};
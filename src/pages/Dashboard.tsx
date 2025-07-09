import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  FileText
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ConversionsChart } from "@/components/ConversionsChart";

interface Lead {
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
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  fbp?: string;
  documents: string[];
}

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [period, setPeriod] = useState("30");
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticação
    if (!localStorage.getItem('sos-auth')) {
      navigate('/login');
      return;
    }

    // Carregar leads do localStorage
    const storedLeads = JSON.parse(localStorage.getItem('sos-leads') || '[]');
    setLeads(storedLeads);
  }, [navigate]);

  // Função para obter período de data
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    if (period === 'custom') {
      if (customStartDate && customEndDate) {
        return {
          start: new Date(customStartDate),
          end: new Date(customEndDate)
        };
      }
      start.setDate(start.getDate() - 30);
    } else {
      start.setDate(start.getDate() - parseInt(period));
    }
    
    return { start, end };
  };

  // Métricas do período atual
  const getCurrentPeriodMetrics = () => {
    const { start, end } = getDateRange();
    
    const periodLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= start && leadDate <= end;
    });

    const periodClients = leads.filter(lead => {
      if (lead.status !== 'Cliente' || !lead.conversionDate) return false;
      const convDate = new Date(lead.conversionDate);
      return convDate >= start && convDate <= end;
    });

    const totalRevenue = periodClients.reduce((sum, lead) => sum + (lead.amount || 0), 0);
    const conversionRate = periodLeads.length > 0 ? 
      (periodClients.length / periodLeads.length) * 100 : 0;

    return {
      totalLeads: periodLeads.length,
      totalClients: periodClients.length,
      totalRevenue,
      conversionRate
    };
  };

  // Métricas do período anterior (para comparação)
  const getPreviousPeriodMetrics = () => {
    const { start, end } = getDateRange();
    const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - periodDays);
    
    const prevPeriodLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= prevStart && leadDate <= prevEnd;
    });

    const prevPeriodClients = leads.filter(lead => {
      if (lead.status !== 'Cliente' || !lead.conversionDate) return false;
      const convDate = new Date(lead.conversionDate);
      return convDate >= prevStart && convDate <= prevEnd;
    });

    const totalRevenue = prevPeriodClients.reduce((sum, lead) => sum + (lead.amount || 0), 0);
    
    return {
      totalLeads: prevPeriodLeads.length,
      totalClients: prevPeriodClients.length,
      totalRevenue
    };
  };

  // Dados para gráfico de leads (baseado no período selecionado)
  const getLeadsByPeriod = () => {
    const { start, end } = getDateRange();
    const data = [];
    
    if (period === '7') {
      // Para 7 dias, mostrar por dia
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        
        const dayLeads = leads.filter(lead => {
          const leadDate = new Date(lead.createdAt);
          return leadDate.toDateString() === date.toDateString();
        });
        
        data.push({
          period: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          leads: dayLeads.length
        });
      }
    } else {
      // Para 30+ dias, agrupar por semana
      const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekLeads = leads.filter(lead => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= weekStart && leadDate <= weekEnd;
        });
        
        data.push({
          period: `Sem ${i + 1}`,
          leads: weekLeads.length
        });
      }
    }
    
    return data;
  };

  // Formatar data range para exibição
  const getDateRangeDisplay = () => {
    const { start, end } = getDateRange();
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
  };

  // Handler para mudança de período
  const handlePeriodChange = async (newPeriod: string) => {
    setIsLoading(true);
    setPeriod(newPeriod);
    
    // Simular loading para UX
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };


  const currentMetrics = getCurrentPeriodMetrics();
  const previousMetrics = getPreviousPeriodMetrics();
  const revenueGrowth = previousMetrics.totalRevenue > 0 ? 
    ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusCounts = () => {
    const { start, end } = getDateRange();
    
    const periodLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= start && leadDate <= end;
    });
    
    return {
      novoLead: periodLeads.filter(l => l.status === 'Novo Lead').length,
      emNegociacao: periodLeads.filter(l => l.status === 'Em Negociação').length,
      cliente: periodLeads.filter(l => l.status === 'Cliente').length,
      naoCliente: periodLeads.filter(l => l.status === 'Não Cliente').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/crm')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao CRM
            </Button>
            <h1 className="text-2xl font-bold">
              Dashboard - SOS <span className="text-orange-500">Multas</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            )}
            <div className="flex flex-col items-end">
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-500 mt-1">{getDateRangeDisplay()}</span>
            </div>
            {period === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Valor Total Cobrado */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita do Período</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentMetrics.totalRevenue)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
                <span className="ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* Total de Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads do Período</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                Período anterior: {previousMetrics.totalLeads}
              </p>
            </CardContent>
          </Card>

          {/* Taxa de Conversão */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {currentMetrics.totalClients} de {currentMetrics.totalLeads} leads
              </p>
            </CardContent>
          </Card>

          {/* Novos Clientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Período anterior: {previousMetrics.totalClients}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Leads por Período */}
          <Card>
            <CardHeader>
              <CardTitle>Leads por {period === '7' ? 'Dia' : 'Semana'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getLeadsByPeriod()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversões por Dia */}
          <ConversionsChart 
            leads={leads} 
            globalPeriod={period}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
          />
        </div>

        {/* Indicadores Auxiliares */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{statusCounts.novoLead}</div>
              <div className="text-sm text-gray-600">Novos Leads</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{statusCounts.emNegociacao}</div>
              <div className="text-sm text-gray-600">Em Negociação</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-500">{statusCounts.naoCliente}</div>
              <div className="text-sm text-gray-600">Não Clientes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{statusCounts.cliente}</div>
              <div className="text-sm text-gray-600">Clientes Ativos</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
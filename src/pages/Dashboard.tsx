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
  FileText,
  Eye
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

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
  const getDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
  };

  // Métricas do mês atual
  const getCurrentMonthMetrics = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
    });

    const currentMonthClients = leads.filter(lead => {
      return lead.status === 'Cliente' && lead.conversionDate && 
        new Date(lead.conversionDate).getMonth() === currentMonth && 
        new Date(lead.conversionDate).getFullYear() === currentYear;
    });

    const totalRevenue = currentMonthClients.reduce((sum, lead) => sum + (lead.amount || 0), 0);
    const conversionRate = currentMonthLeads.length > 0 ? 
      (currentMonthClients.length / currentMonthLeads.length) * 100 : 0;

    return {
      totalLeads: currentMonthLeads.length,
      totalClients: currentMonthClients.length,
      totalRevenue,
      conversionRate
    };
  };

  // Métricas do mês anterior
  const getPreviousMonthMetrics = () => {
    const now = new Date();
    const prevMonth = now.getMonth() - 1;
    const prevYear = prevMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const adjustedMonth = prevMonth < 0 ? 11 : prevMonth;
    
    const prevMonthLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === adjustedMonth && leadDate.getFullYear() === prevYear;
    });

    const prevMonthClients = leads.filter(lead => {
      return lead.status === 'Cliente' && lead.conversionDate && 
        new Date(lead.conversionDate).getMonth() === adjustedMonth && 
        new Date(lead.conversionDate).getFullYear() === prevYear;
    });

    const totalRevenue = prevMonthClients.reduce((sum, lead) => sum + (lead.amount || 0), 0);
    
    return {
      totalLeads: prevMonthLeads.length,
      totalClients: prevMonthClients.length,
      totalRevenue
    };
  };

  // Dados para gráfico de leads por mês (últimos 6 meses)
  const getLeadsByMonth = () => {
    const monthsData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthLeads = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.getMonth() === date.getMonth() && 
               leadDate.getFullYear() === date.getFullYear();
      });
      
      monthsData.push({
        month: monthName,
        leads: monthLeads.length
      });
    }
    
    return monthsData;
  };

  // Dados para gráfico de conversões por dia (últimos 30 dias)
  const getConversionsByDay = () => {
    const daysData = [];
    const { start } = getDateRange(30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      const dayConversions = leads.filter(lead => {
        if (!lead.conversionDate || lead.status !== 'Cliente') return false;
        const convDate = new Date(lead.conversionDate);
        return convDate.toDateString() === date.toDateString();
      });
      
      daysData.push({
        day: date.getDate(),
        conversions: dayConversions.length
      });
    }
    
    return daysData;
  };

  const currentMetrics = getCurrentMonthMetrics();
  const previousMetrics = getPreviousMonthMetrics();
  const revenueGrowth = previousMetrics.totalRevenue > 0 ? 
    ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusCounts = () => {
    return {
      novoLead: leads.filter(l => l.status === 'Novo Lead').length,
      emAnalise: leads.filter(l => l.status === 'Em Análise').length,
      recursoElaborado: leads.filter(l => l.status === 'Recurso Elaborado').length,
      cliente: leads.filter(l => l.status === 'Cliente').length
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
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Valor Total Cobrado */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
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
                <span className="ml-1">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* Total de Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads do Mês</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                Mês anterior: {previousMetrics.totalLeads}
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
                Mês anterior: {previousMetrics.totalClients}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Leads por Mês */}
          <Card>
            <CardHeader>
              <CardTitle>Leads por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getLeadsByMonth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversões por Dia */}
          <Card>
            <CardHeader>
              <CardTitle>Conversões por Dia (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getConversionsByDay()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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
              <div className="text-2xl font-bold text-yellow-500">{statusCounts.emAnalise}</div>
              <div className="text-sm text-gray-600">Em Análise</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{statusCounts.recursoElaborado}</div>
              <div className="text-sm text-gray-600">Recursos Enviados</div>
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
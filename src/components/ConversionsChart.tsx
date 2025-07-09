import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Dot
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

interface ConversionsChartProps {
  leads: Lead[];
}

type PeriodType = '7' | '30' | '90' | 'custom';

interface ChartData {
  day: string;
  date: string;
  conversions: number;
  leads: number;
  fullDate: Date;
}

export const ConversionsChart = ({ leads }: ConversionsChartProps) => {
  const [period, setPeriod] = useState<PeriodType>('30');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getDateRange = (periodType: PeriodType) => {
    const end = new Date();
    const start = new Date();
    
    switch (periodType) {
      case '7':
        start.setDate(start.getDate() - 7);
        break;
      case '30':
        start.setDate(start.getDate() - 30);
        break;
      case '90':
        start.setDate(start.getDate() - 90);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate)
          };
        }
        start.setDate(start.getDate() - 30);
        break;
    }
    
    return { start, end };
  };

  const chartData = useMemo(() => {
    const { start, end } = getDateRange(period);
    const data: ChartData[] = [];
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      const dayConversions = leads.filter(lead => {
        if (!lead.conversionDate || lead.status !== 'Cliente') return false;
        const convDate = new Date(lead.conversionDate);
        return convDate.toDateString() === date.toDateString();
      });

      const dayLeads = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.toDateString() === date.toDateString();
      });
      
      data.push({
        day: date.getDate().toString(),
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        conversions: dayConversions.length,
        leads: dayLeads.length,
        fullDate: date
      });
    }
    
    return data;
  }, [leads, period, customStartDate, customEndDate]);

  const totalConversions = chartData.reduce((sum, item) => sum + item.conversions, 0);
  const totalLeads = chartData.reduce((sum, item) => sum + item.leads, 0);
  const averageConversions = totalConversions / chartData.length;
  const averageLeads = totalLeads / chartData.length;
  const maxConversions = Math.max(...chartData.map(item => item.conversions));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullDate.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'long' 
          })}</p>
          <p className="text-blue-600 font-semibold">
            {data.leads} lead{data.leads !== 1 ? 's' : ''}
          </p>
          <p className="text-green-600 font-semibold">
            {data.conversions} conversão{data.conversions !== 1 ? 'ões' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.conversions > 0) {
      return (
        <Dot 
          cx={cx} 
          cy={cy} 
          r={4} 
          fill="#10b981" 
          stroke="#059669" 
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Leads x Conversões por Dia
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            
            {period === 'custom' && (
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-32"
                />
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-32"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Leads: {totalLeads} | Conversões: {totalConversions}</span>
          </div>
          <div>Média leads: {averageLeads.toFixed(1)} | Conversões: {averageConversions.toFixed(1)} por dia</div>
          {maxConversions > 0 && <div>Pico conversões: {maxConversions}</div>}
        </div>
      </CardHeader>
      
      <CardContent>
        {totalConversions === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conversão registrada</h3>
            <p className="text-center">
              Não há conversões no período selecionado.
              <br />
              Tente selecionar um período diferente.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e0e0e0' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#1d4ed8', strokeWidth: 2, fill: '#3b82f6' }}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2, fill: '#10b981' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
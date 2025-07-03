
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, FileText, Calendar, DollarSign, LogOut, Plus, Eye } from "lucide-react";
import { toast } from "sonner";

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
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  fbp?: string;
  documents: string[];
}

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { id: 'Novo Lead', title: 'Novo Lead', color: 'bg-blue-100 border-blue-300' },
    { id: 'Em Análise', title: 'Em Análise', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'Recurso Elaborado', title: 'Recurso Elaborado', color: 'bg-purple-100 border-purple-300' },
    { id: 'Finalizado', title: 'Finalizado', color: 'bg-green-100 border-green-300' }
  ];

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

  const handleLogout = () => {
    localStorage.removeItem('sos-auth');
    navigate('/login');
  };

  const updateLeadStatus = (leadId: number, newStatus: string) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('sos-leads', JSON.stringify(updatedLeads));
    toast.success("Status atualizado com sucesso!");
  };

  const updateLead = (updatedLead: Lead) => {
    const updatedLeads = leads.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('sos-leads', JSON.stringify(updatedLeads));
    setIsEditModalOpen(false);
    toast.success("Lead atualizado com sucesso!");
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getViolationTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'excesso-velocidade': 'Excesso de Velocidade',
      'avanco-sinal': 'Avanço de Sinal',
      'bafometro': 'Bafômetro',
      'suspensao': 'Suspensão',
      'cassacao': 'Cassação',
      'multas': 'Multas Gerais',
      'outras': 'Outras'
    };
    return types[type] || type;
  };

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm truncate">{lead.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedLead(lead);
              setIsEditModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span className="truncate">{lead.phone}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="truncate">{lead.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span className="truncate">{getViolationTypeLabel(lead.violationType)}</span>
          </div>
          {lead.amount > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="font-semibold text-green-600">{formatCurrency(lead.amount)}</span>
            </div>
          )}
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.utm_source && (
            <Badge variant="outline" className="text-xs">
              {lead.utm_source}
            </Badge>
          )}
          {lead.gclid && (
            <Badge variant="outline" className="text-xs bg-blue-50">
              Google Ads
            </Badge>
          )}
          {lead.fbp && (
            <Badge variant="outline" className="text-xs bg-blue-50">
              Meta Ads
            </Badge>
          )}
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
          </span>
          <Select onValueChange={(value) => updateLeadStatus(lead.id, value)}>
            <SelectTrigger className="w-auto h-6 text-xs">
              <SelectValue placeholder="Mover" />
            </SelectTrigger>
            <SelectContent>
              {columns.map(col => (
                <SelectItem key={col.id} value={col.id} disabled={col.id === lead.status}>
                  {col.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            SOS <span className="text-orange-500">Multas</span> - CRM
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Total de Leads: {leads.length}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {columns.map(column => (
            <Card key={column.id}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {getLeadsByStatus(column.id).length}
                </div>
                <div className="text-sm text-gray-600">{column.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className={`${column.color} rounded-lg border-2 border-dashed`}>
              <div className="p-4 bg-white rounded-t-lg">
                <h2 className="font-semibold text-lg mb-2">{column.title}</h2>
                <div className="text-sm text-gray-600">
                  {getLeadsByStatus(column.id).length} leads
                </div>
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                {getLeadsByStatus(column.id).map(lead => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                
                {getLeadsByStatus(column.id).length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum lead nesta etapa</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Lead Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={selectedLead.name}
                    onChange={(e) => setSelectedLead({...selectedLead, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={selectedLead.phone}
                    onChange={(e) => setSelectedLead({...selectedLead, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">E-mail</label>
                <Input
                  value={selectedLead.email}
                  onChange={(e) => setSelectedLead({...selectedLead, email: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Multa</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {getViolationTypeLabel(selectedLead.violationType)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Valor Cobrado</label>
                  <Input
                    type="number"
                    value={selectedLead.amount || 0}
                    onChange={(e) => setSelectedLead({...selectedLead, amount: Number(e.target.value)})}
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={selectedLead.status} 
                  onValueChange={(value) => setSelectedLead({...selectedLead, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Observações Internas</label>
                <Textarea
                  value={selectedLead.observations}
                  onChange={(e) => setSelectedLead({...selectedLead, observations: e.target.value})}
                  placeholder="Adicione observações sobre este lead..."
                  rows={3}
                />
              </div>
              
              {/* Dados de Tracking */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Dados de Origem</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedLead.utm_source && (
                    <div><strong>Fonte:</strong> {selectedLead.utm_source}</div>
                  )}
                  {selectedLead.utm_medium && (
                    <div><strong>Mídia:</strong> {selectedLead.utm_medium}</div>
                  )}
                  {selectedLead.utm_campaign && (
                    <div><strong>Campanha:</strong> {selectedLead.utm_campaign}</div>
                  )}
                  {selectedLead.gclid && (
                    <div><strong>Google Ads:</strong> Sim</div>
                  )}
                  {selectedLead.fbp && (
                    <div><strong>Meta Ads:</strong> Sim</div>
                  )}
                  <div><strong>Data:</strong> {new Date(selectedLead.createdAt).toLocaleString('pt-BR')}</div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => updateLead(selectedLead)}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRM;

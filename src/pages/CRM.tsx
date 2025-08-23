import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BarChart3, LogOut, FileText, Search, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Lead, CRM_COLUMNS, convertLeadFromDB } from "@/types/lead";
import { LeadCard } from "@/components/LeadCard";
import { LeadModal } from "@/components/LeadModal";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getDaysFromDate } from "@/utils/leadUtils";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useLeads } from "@/hooks/useLeads";
import { UserManagement } from "@/components/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CRM = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('leads');
  const navigate = useNavigate();
  
  const { user, loading: authLoading, signOut, authorizedUser, isAuthenticated, isAuthorized } = useSupabaseAuth();
  const { leads: dbLeads, loading: leadsLoading, updateLeadStatus, updateLead } = useLeads();

  // Convert DB leads to frontend format
  const leads = dbLeads.map(convertLeadFromDB);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    } else if (!authLoading && user && !isAuthorized) {
      toast.error('Acesso não autorizado. Entre em contato com o administrador.');
      navigate('/auth');
    }
  }, [user, authLoading, isAuthenticated, isAuthorized, navigate]);

  useEffect(() => {
    if (leads.length > 0) {
      // alerta de follow-up para Novo Lead parado >=3 dias
      const followUps = leads.filter((l: Lead) => 
        l.status === 'novo-lead' && 
        getDaysFromDate(l.lastMovedAt || l.createdAt) >= 3
      );
      if (followUps.length > 0) {
        toast.warning(`Há ${followUps.length} lead(s) aguardando follow-up há 3+ dias em Novo Lead.`);
      }
    }
  }, [leads]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || leadsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const leadId = draggableId;
    const newStatus = destination.droppableId;
    
    updateLeadStatus(leadId, newStatus);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleSaveLead = (updatedLead: Lead) => {
    const updates = {
      name: updatedLead.name,
      email: updatedLead.email,
      phone: updatedLead.phone,
      violation_type: updatedLead.violationType,
      observations: updatedLead.observations,
      amount: updatedLead.amount,
      payment_method: updatedLead.paymentMethod,
      rejection_reason: updatedLead.rejectionReason,
      tags: updatedLead.tags,
      cnh_at_risk: updatedLead.cnhAtRisk,
      appealed_before: updatedLead.appealedBefore,
      urgency: updatedLead.urgency,
    };
    
    updateLead(updatedLead.id, updates);
  };

  const getLeadsByStatus = (status: string) => {
    let filteredLeads = leads.filter(lead => lead.status === status);
    if (filterType !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.violationType === filterType);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.name.toLowerCase().includes(q) || 
        lead.email?.toLowerCase().includes(q) ||
        lead.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      );
    }
    return filteredLeads;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/a07a1208-5b54-4395-9bc1-66dd1b69b39d.png" 
                alt="SOS Multas" 
                className="h-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CRM - SOS Multas</h1>
                <p className="text-sm text-gray-600">
                  Olá, {authorizedUser?.first_name || user?.user_metadata?.first_name || user?.email}
                  {authorizedUser?.role && authorizedUser.role !== 'user' && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {authorizedUser.role}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Ir para Site
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gestão de Leads
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Usuários Autorizados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {CRM_COLUMNS.map((column) => {
                const count = getLeadsByStatus(column.id).length;
                return (
                  <Card key={column.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{column.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                        </div>
                        <div className={`p-3 rounded-full ${column.bgColor}`}>
                          <column.icon className={`h-6 w-6 ${column.textColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Todos os tipos de multa</option>
                <option value="excesso-velocidade">Excesso de Velocidade</option>
                <option value="excesso-pontos">Excesso de Pontos</option>
                <option value="bafometro">Bafômetro</option>
                <option value="suspensao-cnh">Suspensão da CNH</option>
                <option value="cassacao-cnh">Cassação da CNH</option>
              </select>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {CRM_COLUMNS.map((column) => {
                  const columnLeads = getLeadsByStatus(column.id);
                  
                  return (
                    <div key={column.id} className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <column.icon className={`h-5 w-5 ${column.textColor}`} />
                          {column.title}
                        </h3>
                        <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                          {columnLeads.length}
                        </span>
                      </div>
                      
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`space-y-3 min-h-[200px] ${
                              snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg' : ''
                            }`}
                          >
                            {columnLeads.map((lead, index) => (
                              <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={snapshot.isDragging ? 'rotate-3 scale-105' : ''}
                                  >
                                    <LeadCard 
                                      lead={lead} 
                                      onViewDetails={() => handleLeadClick(lead)}
                                      onStatusChange={updateLeadStatus}
                                      columns={CRM_COLUMNS}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de edição */}
      <LeadModal
        lead={selectedLead}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
        onSave={handleSaveLead}
        columns={CRM_COLUMNS}
      />
    </div>
  );
};

export default CRM;
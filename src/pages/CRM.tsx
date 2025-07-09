
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BarChart3, LogOut, FileText, Filter } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Lead, CRM_COLUMNS } from "@/types/lead";
import { LeadCard } from "@/components/LeadCard";
import { LeadModal } from "@/components/LeadModal";

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
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

  const handleLogout = () => {
    localStorage.removeItem('sos-auth');
    navigate('/login');
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const leadId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = { ...lead, status: newStatus };
        
        // Se movendo para Cliente, definir data de conversão
        if (newStatus === 'Cliente' && !lead.conversionDate) {
          updatedLead.conversionDate = new Date().toISOString();
        }
        
        return updatedLead;
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    localStorage.setItem('sos-leads', JSON.stringify(updatedLeads));
    toast.success(`Lead movido para ${newStatus}!`);
  };

  const updateLeadStatus = (leadId: number, newStatus: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = { ...lead, status: newStatus };
        
        // Se movendo para Cliente, definir data de conversão
        if (newStatus === 'Cliente' && !lead.conversionDate) {
          updatedLead.conversionDate = new Date().toISOString();
        }
        
        return updatedLead;
      }
      return lead;
    });
    
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
    let filteredLeads = leads.filter(lead => lead.status === status);
    
    if (filterType !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.violationType === filterType);
    }
    
    return filteredLeads;
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Modernizado */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              SOS Multas - CRM
            </h1>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-white/60 rounded-full px-3 py-1">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-orange-600">{leads.length} leads</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="hover:bg-blue-50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Estatísticas do Funil */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {CRM_COLUMNS.map(column => {
            const count = getLeadsByStatus(column.id).length;
            const percentage = leads.length > 0 ? (count / leads.length * 100).toFixed(1) : '0';
            
            return (
              <Card key={column.id} className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-3 h-3 rounded-full ${column.color.includes('blue') ? 'bg-blue-500' : 
                                     column.color.includes('orange') ? 'bg-orange-500' : 
                                     column.color.includes('green') ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-xs text-gray-500">{percentage}%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                  <div className="text-sm text-gray-600">{column.title}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Kanban Board Modernizado */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CRM_COLUMNS.map(column => (
              <div key={column.id} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className={`${column.color} p-4 border-b border-gray-200`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`font-semibold text-lg ${column.textColor}`}>
                      {column.title}
                    </h2>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium bg-white/80 ${column.textColor}`}>
                      {getLeadsByStatus(column.id).length}
                    </div>
                  </div>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 max-h-[600px] overflow-y-auto min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                      } transition-colors duration-200`}
                    >
                      {getLeadsByStatus(column.id).map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? 'rotate-2 scale-105' : ''} transition-transform duration-200`}
                            >
                              <LeadCard 
                                lead={lead} 
                                onViewDetails={handleViewDetails}
                                onStatusChange={updateLeadStatus}
                                columns={CRM_COLUMNS}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {getLeadsByStatus(column.id).length === 0 && (
                        <div className="text-center text-gray-400 py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <FileText className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="text-sm">Nenhum lead nesta etapa</p>
                          <p className="text-xs text-gray-300 mt-1">Arraste leads aqui</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Modal de Detalhes Modernizado */}
      <LeadModal 
        lead={selectedLead}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateLead}
        columns={CRM_COLUMNS}
      />
    </div>
  );
};

export default CRM;

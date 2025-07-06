import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, FileText, DollarSign, Calendar, MapPin, TrendingUp, Clock, X } from "lucide-react";
import { Lead } from "@/types/lead";
import { formatCurrency, getViolationTypeLabel, getViolationIcon, getDaysFromDate, getSourceIcon } from "@/utils/leadUtils";

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
  columns: Array<{ id: string; title: string; color: string; textColor: string }>;
}

const REJECTION_REASONS = [
  'Não respondeu',
  'Desistiu',
  'Fora do perfil',
  'Valor muito alto',
  'Já resolvido',
  'Outro'
];

export const LeadModal = ({ lead, isOpen, onClose, onSave, columns }: LeadModalProps) => {
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [showRejectionReason, setShowRejectionReason] = useState(false);

  // Atualizar quando o lead mudar
  useEffect(() => {
    if (lead) {
      setEditedLead({ ...lead });
      setShowRejectionReason(lead.status === 'Não Cliente');
    }
  }, [lead]);

  if (!lead || !editedLead) return null;

  const daysOld = getDaysFromDate(lead.createdAt);
  const isNewClient = editedLead.status === 'Cliente' && lead.status !== 'Cliente';
  const isRejected = editedLead.status === 'Não Cliente';

  const handleStatusChange = (newStatus: string) => {
    setEditedLead({ ...editedLead, status: newStatus });
    
    // Se movendo para Cliente, definir data de conversão
    if (newStatus === 'Cliente' && !editedLead.conversionDate) {
      setEditedLead(prev => prev ? { 
        ...prev, 
        status: newStatus,
        conversionDate: new Date().toISOString() 
      } : null);
    }
    
    // Se movendo para Não Cliente, mostrar campo de motivo
    if (newStatus === 'Não Cliente') {
      setShowRejectionReason(true);
    } else {
      setShowRejectionReason(false);
      if (editedLead.rejectionReason) {
        setEditedLead(prev => prev ? { ...prev, rejectionReason: undefined } : null);
      }
    }
  };

  const handleSave = () => {
    if (editedLead) {
      onSave(editedLead);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {editedLead.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysOld} dia{daysOld !== 1 ? 's' : ''} no funil
                  </Badge>
                  {daysOld > 10 && (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      ⚠️ Lead antigo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Dados Principais */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados Principais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nome</label>
                <Input
                  value={editedLead.name}
                  onChange={(e) => setEditedLead({...editedLead, name: e.target.value})}
                  className="border-gray-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={editedLead.phone}
                    onChange={(e) => setEditedLead({...editedLead, phone: e.target.value})}
                    className="pl-10 border-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={editedLead.email}
                    onChange={(e) => setEditedLead({...editedLead, email: e.target.value})}
                    className="pl-10 border-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Valor Cobrado</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={editedLead.amount || 0}
                    onChange={(e) => setEditedLead({...editedLead, amount: Number(e.target.value)})}
                    className="pl-10 border-gray-200"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de Multa</label>
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
                <span className="text-xl">{getViolationIcon(editedLead.violationType)}</span>
                <span className="font-medium text-gray-900">
                  {getViolationTypeLabel(editedLead.violationType)}
                </span>
              </div>
            </div>
          </div>

          {/* Status e Histórico */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Status e Histórico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status Atual</label>
                <Select value={editedLead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="border-gray-200 bg-white">
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Data de Entrada</label>
                <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(editedLead.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Campos específicos para Cliente */}
            {(editedLead.status === 'Cliente' || isNewClient) && (
              <>
                <Separator className="my-4" />
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Informações de Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Data de Conversão</label>
                      <Input
                        type="date"
                        value={editedLead.conversionDate ? new Date(editedLead.conversionDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedLead({...editedLead, conversionDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                        className="border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Método de Pagamento</label>
                      <Select 
                        value={editedLead.paymentMethod || ''} 
                        onValueChange={(value) => setEditedLead({...editedLead, paymentMethod: value})}
                      >
                        <SelectTrigger className="border-gray-200 bg-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="cartao">Cartão</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Campo de motivo de rejeição */}
            {showRejectionReason && (
              <>
                <Separator className="my-4" />
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-3">Motivo da Não Conversão</h4>
                  <Select 
                    value={editedLead.rejectionReason || ''} 
                    onValueChange={(value) => setEditedLead({...editedLead, rejectionReason: value})}
                  >
                    <SelectTrigger className="border-gray-200 bg-white">
                      <SelectValue placeholder="Selecione o motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {REJECTION_REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Origem da Campanha */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Origem da Campanha
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {editedLead.utm_source && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Fonte</div>
                  <div className="flex items-center gap-1 mt-1">
                    {getSourceIcon(editedLead.utm_source)}
                    <span className="text-gray-900">{editedLead.utm_source}</span>
                  </div>
                </div>
              )}
              {editedLead.utm_medium && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Mídia</div>
                  <div className="text-gray-900 mt-1">{editedLead.utm_medium}</div>
                </div>
              )}
              {editedLead.utm_campaign && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Campanha</div>
                  <div className="text-gray-900 mt-1">{editedLead.utm_campaign}</div>
                </div>
              )}
              {editedLead.gclid && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Google Ads</div>
                  <div className="text-green-600 mt-1">✓ Ativo</div>
                </div>
              )}
              {editedLead.fbp && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Meta Ads</div>
                  <div className="text-blue-600 mt-1">✓ Ativo</div>
                </div>
              )}
            </div>
          </div>

          {/* Observações Internas */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações Internas
            </h3>
            <Textarea
              value={editedLead.observations}
              onChange={(e) => setEditedLead({...editedLead, observations: e.target.value})}
              placeholder="Adicione observações sobre este lead..."
              rows={4}
              className="border-gray-200 bg-white"
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Phone, Mail, Eye, Clock, DollarSign, Tags } from "lucide-react";
import { Lead } from "@/types/lead";
import { formatCurrency, getViolationTypeLabel, getViolationIcon, getDaysFromDate, getSourceIcon } from "@/utils/leadUtils";

interface LeadCardProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: string) => void;
  columns: Array<{ id: string; title: string; color: string; textColor: string }>;
}

export const LeadCard = ({ lead, onViewDetails, onStatusChange, columns }: LeadCardProps) => {
  const daysOld = getDaysFromDate(lead.createdAt);
  
  return (
    <Card className="mb-3 group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white border border-gray-100 rounded-xl overflow-hidden">
      <CardContent className="p-4">
        {/* Header com nome e ações */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate text-sm">{lead.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{daysOld} dia{daysOld !== 1 ? 's' : ''}</span>
              </div>
              {daysOld > 7 && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  Antigo
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(lead)}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Informações de contato */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="h-3 w-3 text-gray-400" />
            <span className="truncate">{lead.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="truncate">{lead.email}</span>
          </div>
        </div>
        
        {/* Tipo de multa com ícone */}
        <div className="mb-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <span className="text-lg">{getViolationIcon(lead.violationType)}</span>
            <span className="text-xs font-medium text-gray-700 truncate">
              {getViolationTypeLabel(lead.violationType)}
            </span>
          </div>
        </div>
        
        {/* Valor cobrado */}
        {lead.amount > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {formatCurrency(lead.amount)}
              </span>
            </div>
          </div>
        )}
        
        {/* Tags de origem */}
        <div className="mb-3 flex flex-wrap gap-1">
          {lead.utm_source && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {getSourceIcon(lead.utm_source)} {lead.utm_source}
            </Badge>
          )}
          {lead.gclid && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              🔍 Google Ads
            </Badge>
          )}
          {lead.fbp && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              📘 Meta Ads
            </Badge>
          )}
        </div>
        
        {/* Footer com data e ações */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {new Date(lead.createdAt).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'short' 
            })}
          </span>
          <Select onValueChange={(value) => onStatusChange(lead.id, value)}>
            <SelectTrigger className="w-auto h-7 text-xs border-gray-200 hover:border-gray-300">
              <SelectValue placeholder="Mover" />
            </SelectTrigger>
            <SelectContent>
              {columns.map(col => (
                <SelectItem 
                  key={col.id} 
                  value={col.id} 
                  disabled={col.id === lead.status}
                  className="text-xs"
                >
                  {col.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
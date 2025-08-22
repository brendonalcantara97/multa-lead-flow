import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Mail, Shield, UserCheck, Send, Key } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthorizedEmail {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  has_account?: boolean;
  invitation_sent?: boolean;
  invitation_sent_at?: string | null;
}

export const UserManagement = () => {
  const [authorizedEmails, setAuthorizedEmails] = useState<AuthorizedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });

  useEffect(() => {
    fetchAuthorizedEmails();
  }, []);

  const fetchAuthorizedEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAuthorizedEmails(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar emails autorizados:', error);
      toast.error('Erro ao carregar usuários autorizados');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email) {
      toast.error('Email é obrigatório');
      return;
    }

    setAddingUser(true);
    try {
      const { error } = await supabase
        .from('authorized_emails')
        .insert({
          email: newUser.email.toLowerCase(),
          first_name: newUser.firstName || null,
          last_name: newUser.lastName || null,
          role: newUser.role,
          is_active: true
        });

      if (error) {
        if (error.code === '23505') { // unique constraint violation
          throw new Error('Este email já está cadastrado');
        }
        throw error;
      }

      toast.success('Usuário adicionado com sucesso! Clique em "Enviar Convite" para criar a conta.');
      setNewUser({ email: '', firstName: '', lastName: '', role: 'user' });
      fetchAuthorizedEmails();
    } catch (error: any) {
      console.error('Erro ao adicionar usuário:', error);
      toast.error(error.message || 'Erro ao adicionar usuário');
    } finally {
      setAddingUser(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('authorized_emails')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(currentStatus ? 'Usuário desativado' : 'Usuário ativado');
      fetchAuthorizedEmails();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Tem certeza que deseja remover o acesso de ${email}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('authorized_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Usuário removido com sucesso');
      fetchAuthorizedEmails();
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  const handleSendInvite = async (user: AuthorizedEmail) => {
    setSendingInvite(user.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Convite enviado para ${user.email}!`);
        
        // Update invitation status in database
        await supabase
          .from('authorized_emails')
          .update({ 
            invitation_sent: true, 
            invitation_sent_at: new Date().toISOString(),
            has_account: true 
          })
          .eq('id', user.id);
          
        fetchAuthorizedEmails(); // Refresh to update account status
      } else {
        throw new Error(data?.error || 'Erro ao enviar convite');
      }
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast.error(error.message || 'Erro ao enviar convite');
    } finally {
      setSendingInvite(null);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast.success(`Email de redefinição de senha enviado para ${email}`);
    } catch (error: any) {
      console.error('Erro ao enviar reset de senha:', error);
      toast.error(error.message || 'Erro ao enviar email de redefinição');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      default: return 'Usuário';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Adicionar novo usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com.br"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Nome"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Sobrenome"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" disabled={addingUser}>
              {addingUser ? 'Adicionando...' : 'Adicionar Usuário'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de usuários autorizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Usuários Autorizados ({authorizedEmails.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {authorizedEmails.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum usuário autorizado encontrado</p>
            ) : (
              authorizedEmails.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${user.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {user.is_active ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <Mail className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.email}</span>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleName(user.role)}
                        </Badge>
                        {!user.is_active && (
                          <Badge variant="outline" className="text-gray-500">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      {(user.first_name || user.last_name) && (
                        <p className="text-sm text-gray-600">
                          {user.first_name} {user.last_name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Adicionado em {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                        {user.has_account ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            ✓ Conta criada
                          </Badge>
                        ) : user.invitation_sent ? (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            📧 Convite enviado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            ⏳ Aguardando convite
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!user.has_account ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvite(user)}
                        disabled={sendingInvite === user.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        {sendingInvite === user.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                        ) : (
                          <Send className="h-4 w-4 mr-1" />
                        )}
                        {sendingInvite === user.id ? 'Enviando...' : 'Enviar Convite'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(user.email)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Key className="h-4 w-4 mr-1" />
                        Reset Senha
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
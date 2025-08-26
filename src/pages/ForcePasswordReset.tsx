import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const ForcePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuth();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (passwords.newPassword !== passwords.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (passwords.newPassword.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
        data: {
          is_temp_password: false
        }
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      navigate('/crm');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="text-gray-600 hover:text-orange-600"
        >
          Sair
        </Button>
      </div>

      <div className="flex items-center justify-center px-4 pt-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/a07a1208-5b54-4395-9bc1-66dd1b69b39d.png" 
              alt="SOS Multas" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              SOS Multas
            </h1>
            <p className="text-gray-600 mt-2">Redefinição de Senha Obrigatória</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <Shield className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <CardTitle className="text-2xl">Alterar Senha</CardTitle>
              <p className="text-sm text-gray-600">
                Por segurança, você deve definir uma nova senha antes de continuar
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Digite sua nova senha"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    A senha deve ter pelo menos 6 caracteres
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua nova senha"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Email: {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordReset;
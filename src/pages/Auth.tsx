import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowLeft, Building } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  const navigate = useNavigate();
  const { user, loading, authorizedUser, isAuthorized } = useSupabaseAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && isAuthorized) {
      navigate('/crm');
    } else if (!loading && user && !isAuthorized) {
      // Usuário logado mas não autorizado
      toast.error('Acesso não autorizado. Entre em contato com o administrador.');
    }
  }, [user, loading, isAuthorized, navigate]);

  // Verificar se email está autorizado
  const checkEmailAuthorization = async (email: string) => {
    const { data, error } = await supabase
      .from('authorized_emails')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true);

    if (error) {
      console.error('Error checking authorization:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    return data[0];
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Primeiro verificar se o email está autorizado
      const authorizedEmail = await checkEmailAuthorization(loginData.email);
      
      if (!authorizedEmail) {
        throw new Error('Email não autorizado. Entre em contato com o administrador.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        throw error;
      }

      toast.success('Login realizado com sucesso!');
      navigate('/crm');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro no login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aqui você pode implementar uma lógica para enviar solicitação de convite
      // Por enquanto, vamos apenas mostrar uma mensagem
      toast.info(`Solicitação de acesso enviada para ${inviteEmail}. Aguarde aprovação do administrador.`);
      setInviteEmail('');
      setShowInviteForm(false);
    } catch (error: any) {
      toast.error('Erro ao enviar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if email is authorized
      const authorizedEmail = await checkEmailAuthorization(forgotPasswordEmail);
      
      if (!authorizedEmail) {
        throw new Error('Email não autorizado. Entre em contato com o administrador.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: 'https://sosmultasportoalegre.com.br/auth'
      });

      if (error) throw error;

      toast.success(`Email de redefinição de senha enviado para ${forgotPasswordEmail}`);
      setForgotPasswordEmail('');
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Erro ao enviar email de redefinição');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
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
            <p className="text-gray-600 mt-2">Sistema de Gestão de Leads</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <Building className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <CardTitle className="text-2xl">Acesso Corporativo</CardTitle>
              <p className="text-sm text-gray-600">
                Apenas funcionários autorizados podem acessar
              </p>
            </CardHeader>
            <CardContent>
              {!showInviteForm && !showForgotPassword ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu.email@empresa.com.br"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        required
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
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    Entrar no Sistema
                  </Button>

                  <div className="text-center pt-4 space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-gray-600 hover:text-orange-600 block w-full"
                    >
                      Esqueci minha senha
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowInviteForm(true)}
                      className="text-sm text-gray-600 hover:text-orange-600"
                    >
                      Não tem acesso? Solicitar convite
                    </Button>
                  </div>
                </form>
              ) : showForgotPassword ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Redefinir Senha</h3>
                    <p className="text-sm text-gray-600">
                      Informe seu email para receber instruções de redefinição
                    </p>
                  </div>
                  
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgotEmail">Seu Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="forgotEmail"
                          type="email"
                          placeholder="seu.email@empresa.com.br"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Enviando...' : 'Enviar Email de Redefinição'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full"
                    >
                      Voltar ao Login
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Solicitar Acesso</h3>
                    <p className="text-sm text-gray-600">
                      Informe seu email para solicitar acesso ao sistema
                    </p>
                  </div>
                  
                  <form onSubmit={handleInviteRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Seu Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="seu.email@empresa.com.br"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Enviando...' : 'Solicitar Acesso'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowInviteForm(false)}
                      className="w-full"
                    >
                      Voltar ao Login
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Sistema restrito aos funcionários da SOS Multas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
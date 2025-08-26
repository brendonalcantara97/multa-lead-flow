
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Login simples para demonstração
    if (credentials.username === "admin" && credentials.password === "123456") {
      localStorage.setItem('sos-auth', 'true');
      toast.success("Login realizado com sucesso!");
      navigate('/crm');
    } else {
      toast.error("Credenciais inválidas. Use admin/123456");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            SOS <span className="text-orange-500">Multas</span>
          </CardTitle>
          <p className="text-gray-600">Acesso ao CRM Interno</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Usuário"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
              Entrar
            </Button>
          </form>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo:</strong> Use admin/123456 para acessar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

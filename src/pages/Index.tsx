import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Scale, Shield, Car, MapPin, Phone, Mail, Star, Users, Award } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    violationType: ""
  });

  const [whatsappFormData, setWhatsappFormData] = useState({
    name: "",
    phone: "",
    violationType: ""
  });

  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);

  const [trackingData, setTrackingData] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    gclid: "",
    fbp: "",
    fbc: "",
    ga_client_id: ""
  });

  useEffect(() => {
    // Capturar parâmetros de tracking
    const urlParams = new URLSearchParams(window.location.search);
    const trackingInfo = {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_term: urlParams.get('utm_term') || '',
      gclid: urlParams.get('gclid') || '',
      fbp: localStorage.getItem('_fbp') || '',
      fbc: localStorage.getItem('_fbc') || '',
      ga_client_id: getCookie('_ga') || ''
    };
    setTrackingData(trackingInfo);
  }, []);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return '';
  };

  const scrollToForm = () => {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      // Salvar lead no localStorage (simulando banco de dados)
      const leads = JSON.parse(localStorage.getItem('sos-leads') || '[]');
      const newLead = {
        id: Date.now(),
        ...formData,
        ...trackingData,
        status: 'Novo Lead',
        createdAt: new Date().toISOString(),
        observations: '',
        documents: []
      };
      
      leads.push(newLead);
      localStorage.setItem('sos-leads', JSON.stringify(leads));

      toast.success("Dados enviados com sucesso! Redirecionando para WhatsApp...");
      
      // Redirecionar para WhatsApp após 2 segundos
      setTimeout(() => {
        const message = encodeURIComponent("Olá! Preenchi o formulário no site da SOS Multas e gostaria de receber ajuda com a minha multa.");
        window.open(`https://wa.me/5551999999999?text=${message}`, '_blank');
      }, 2000);

      // Limpar formulário
      setFormData({ name: "", email: "", phone: "", violationType: "" });
      
    } catch (error) {
      toast.error("Erro ao enviar dados. Tente novamente.");
    }
  };

  const handleWhatsappSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsappFormData.name || !whatsappFormData.phone) {
      toast.error("Por favor, preencha nome e telefone");
      return;
    }

    try {
      // Salvar lead simplificado
      const leads = JSON.parse(localStorage.getItem('sos-leads') || '[]');
      const newLead = {
        id: Date.now(),
        name: whatsappFormData.name,
        email: '',
        phone: whatsappFormData.phone,
        violationType: whatsappFormData.violationType || 'Não informado',
        ...trackingData,
        status: 'Novo Lead',
        createdAt: new Date().toISOString(),
        observations: 'Lead via botão WhatsApp',
        documents: []
      };
      
      leads.push(newLead);
      localStorage.setItem('sos-leads', JSON.stringify(leads));

      toast.success("Dados salvos! Redirecionando para WhatsApp...");
      
      // Fechar dialog e redirecionar
      setIsWhatsappDialogOpen(false);
      setTimeout(() => {
        const message = encodeURIComponent(`Olá! Sou ${whatsappFormData.name} e gostaria de receber ajuda com minha multa${whatsappFormData.violationType ? ` de ${whatsappFormData.violationType}` : ''}.`);
        window.open(`https://wa.me/5551999999999?text=${message}`, '_blank');
      }, 1000);

      // Limpar formulário
      setWhatsappFormData({ name: "", phone: "", violationType: "" });
      
    } catch (error) {
      toast.error("Erro ao enviar dados. Tente novamente.");
    }
  };

  const selectViolationType = (type: string) => {
    setFormData(prev => ({ ...prev, violationType: type }));
    scrollToForm();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-black">
            SOS <span className="text-orange-500">Multas</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#sobre" className="text-gray-700 hover:text-orange-500 transition-colors">Sobre</a>
            <a href="#servicos" className="text-gray-700 hover:text-orange-500 transition-colors">Serviços</a>
            <a href="#duvidas" className="text-gray-700 hover:text-orange-500 transition-colors">Dúvidas</a>
            <a href="#unidades" className="text-gray-700 hover:text-orange-500 transition-colors">Unidades</a>
            <a href="#contato" className="text-gray-700 hover:text-orange-500 transition-colors">Contato</a>
          </nav>
        </div>
      </header>

      {/* WhatsApp Float Button with Dialog */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-green-600">
                Fale conosco no WhatsApp
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleWhatsappSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Seu nome *"
                  value={whatsappFormData.name}
                  onChange={(e) => setWhatsappFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="tel"
                  placeholder="Seu WhatsApp *"
                  value={whatsappFormData.phone}
                  onChange={(e) => setWhatsappFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <Select value={whatsappFormData.violationType} onValueChange={(value) => setWhatsappFormData(prev => ({ ...prev, violationType: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo de multa (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excesso-velocidade">Excesso de Velocidade</SelectItem>
                    <SelectItem value="avanco-sinal">Avanço de Sinal</SelectItem>
                    <SelectItem value="bafometro">Bafômetro</SelectItem>
                    <SelectItem value="suspensao">Suspensão</SelectItem>
                    <SelectItem value="cassacao">Cassação</SelectItem>
                    <SelectItem value="outras">Outras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Enviar para WhatsApp
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Recebeu uma multa?<br />
            <span className="text-orange-500">Exerça seu direito</span> de defesa<br />
            com especialistas.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Consultoria Gratuita para Motoristas em Porto Alegre e Região.
          </p>
          <Button 
            onClick={scrollToForm}
            className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Fazer minha análise gratuita
          </Button>
        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Sobre a SOS Multas</h2>
              <p className="text-gray-600 mb-4">
                Há mais de 15 anos defendendo os direitos dos motoristas em Porto Alegre e região. 
                Nossa equipe especializada em direito de trânsito já ajudou milhares de pessoas a 
                reverter multas indevidas e manter suas CNHs.
              </p>
              <p className="text-gray-600 mb-6">
                Oferecemos análise gratuita e trabalhamos com total transparência, sempre 
                buscando a melhor solução para cada caso.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">15+ anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">4.8/5 Google</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">5000+ casos</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?w=500&h=300&fit=crop" 
                alt="Equipe SOS Multas" 
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Conversão */}
      <section id="form-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-black mb-2">
              Análise Gratuita da sua Multa
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Preencha os dados abaixo e receba uma avaliação sem compromisso
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Nome completo *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-4 text-lg border-2 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="email"
                  placeholder="E-mail *"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-4 text-lg border-2 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="tel"
                  placeholder="Telefone com DDD *"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-4 text-lg border-2 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <Select value={formData.violationType} onValueChange={(value) => setFormData(prev => ({ ...prev, violationType: value }))}>
                  <SelectTrigger className="w-full p-4 text-lg border-2 focus:border-orange-500">
                    <SelectValue placeholder="Tipo de multa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excesso-velocidade">Excesso de Velocidade</SelectItem>
                    <SelectItem value="avanco-sinal">Avanço de Sinal</SelectItem>
                    <SelectItem value="bafometro">Bafômetro</SelectItem>
                    <SelectItem value="suspensao">Suspensão</SelectItem>
                    <SelectItem value="cassacao">Cassação</SelectItem>
                    <SelectItem value="outras">Outras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-4 rounded-lg font-semibold"
              >
                Enviar e Receber Análise Gratuita
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-black mb-12">Nossos Serviços</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => selectViolationType('multas')}>
              <CardContent className="pt-6">
                <Scale className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Defesa de Multas</h3>
                <p className="text-gray-600 mb-4">Contestação de multas de trânsito com alta taxa de sucesso</p>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Tenho esse problema
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => selectViolationType('suspensao')}>
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Suspensão da CNH</h3>
                <p className="text-gray-600 mb-4">Defesa contra suspensão do direito de dirigir</p>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Tenho esse problema
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => selectViolationType('cassacao')}>
              <CardContent className="pt-6">
                <Car className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Cassação da CNH</h3>
                <p className="text-gray-600 mb-4">Recursos contra cassação da carteira de habilitação</p>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Tenho esse problema
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-black mb-12">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-lg px-6">
              <AccordionTrigger className="text-left">Tenho chance de reverter minha multa?</AccordionTrigger>
              <AccordionContent>
                Sim! Muitas multas podem ser contestadas por vícios processuais, irregularidades na autuação ou falhas técnicas. 
                Nossa análise gratuita identificará as melhores estratégias para seu caso.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-white rounded-lg px-6">
              <AccordionTrigger className="text-left">Quanto tempo demora o processo?</AccordionTrigger>
              <AccordionContent>
                O prazo varia conforme o tipo de recurso. Defesas de primeira instância: 30-60 dias. 
                Recursos em instâncias superiores podem levar de 3 a 12 meses.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-white rounded-lg px-6">
              <AccordionTrigger className="text-left">O que preciso enviar?</AccordionTrigger>
              <AccordionContent>
                Precisamos da notificação da multa, CNH, documento do veículo e procuração (que fornecemos). 
                Em alguns casos, podem ser necessários documentos adicionais.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="bg-white rounded-lg px-6">
              <AccordionTrigger className="text-left">Quanto custa o serviço?</AccordionTrigger>
              <AccordionContent>
                A análise é gratuita. Os honorários são definidos após avaliação do caso e só cobramos em caso de sucesso 
                na maioria dos processos. Transparência total desde o primeiro contato.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Unidades */}
      <section id="unidades" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-black mb-12">Nossas Unidades</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { city: "Porto Alegre", address: "Rua dos Andradas, 1234 - Centro", phone: "(51) 3333-4444" },
              { city: "Capão da Canoa", address: "Av. Paraguassu, 567 - Centro", phone: "(51) 3333-5555" },
              { city: "Florianópolis", address: "Rua Felipe Schmidt, 890 - Centro", phone: "(48) 3333-6666" },
              { city: "Curitiba", address: "Rua XV de Novembro, 321 - Centro", phone: "(41) 3333-7777" }
            ].map((unit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{unit.city}</h3>
                  <p className="text-gray-600 text-sm mb-3">{unit.address}</p>
                  <div className="flex items-center justify-center gap-2 text-orange-500">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-semibold">{unit.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                SOS <span className="text-orange-500">Multas</span>
              </div>
              <p className="text-gray-400 mb-4">
                Defendendo seus direitos no trânsito há mais de 15 anos.
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span>contato@sosmultaspoa.com.br</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span>(51) 99999-9999</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#sobre" className="hover:text-orange-500 transition-colors">Sobre Nós</a></li>
                <li><a href="#servicos" className="hover:text-orange-500 transition-colors">Serviços</a></li>
                <li><a href="#duvidas" className="hover:text-orange-500 transition-colors">FAQ</a></li>
                <li><a href="/crm" className="hover:text-orange-500 transition-colors">Área Restrita</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Sede Principal</h3>
              <p className="text-gray-400">
                Rua dos Andradas, 1234<br />
                Centro - Porto Alegre/RS<br />
                CEP: 90020-000
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SOS Multas Porto Alegre. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

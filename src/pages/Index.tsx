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
    email: "",
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

    // Log para debug - mostrar dados capturados
    console.log('🔍 Dados de tracking capturados:', trackingInfo);
    console.log('📊 URL atual:', window.location.href);
    console.log('🍪 Cookies disponíveis:', document.cookie);

    // Simular dados para teste se não houver parâmetros reais
    if (!trackingInfo.utm_source && !trackingInfo.gclid) {
      const simulatedData = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'teste_multas_poa',
        utm_term: 'multa+porto+alegre',
        gclid: 'CjwKCAiA1-6PBhBKEiwA',
        fbp: 'fb.1.1234567890.987654321',
        fbc: 'fb.1.1234567890.AbCdEfGhIjKlMnOpQrStUvWxYz',
        ga_client_id: 'GA1.2.1234567890.1234567890'
      };
      console.log('🧪 Simulando dados de tracking para teste:', simulatedData);
      setTrackingData(simulatedData);
    }
  }, []);
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return '';
  };
  const scrollToForm = () => {
    document.getElementById('form-section')?.scrollIntoView({
      behavior: 'smooth'
    });
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

      // Log detalhado do lead sendo salvo
      console.log('💾 Salvando novo lead:', newLead);
      console.log('📈 Dados de tracking incluídos:', trackingData);
      leads.push(newLead);
      localStorage.setItem('sos-leads', JSON.stringify(leads));

      // Mostrar dados salvos no console
      console.log('✅ Lead salvo com sucesso! Total de leads:', leads.length);
      console.log('🗄️ Todos os leads no localStorage:', leads);
      toast.success("Dados enviados com sucesso! Redirecionando para WhatsApp...");

      // Redirecionar para WhatsApp após 2 segundos
      setTimeout(() => {
        const message = encodeURIComponent("Olá! Preenchi o formulário no site da SOS Multas e gostaria de receber ajuda com a minha multa.");
        window.open(`https://wa.me/5551999999999?text=${message}`, '_blank');
      }, 2000);

      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        violationType: ""
      });
    } catch (error) {
      console.error('❌ Erro ao salvar lead:', error);
      toast.error("Erro ao enviar dados. Tente novamente.");
    }
  };
  const handleWhatsappSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappFormData.name || !whatsappFormData.email || !whatsappFormData.phone) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    try {
      // Salvar lead simplificado
      const leads = JSON.parse(localStorage.getItem('sos-leads') || '[]');
      const newLead = {
        id: Date.now(),
        name: whatsappFormData.name,
        email: whatsappFormData.email,
        phone: whatsappFormData.phone,
        violationType: whatsappFormData.violationType || 'Não informado',
        ...trackingData,
        status: 'Novo Lead',
        createdAt: new Date().toISOString(),
        observations: 'Lead via botão WhatsApp',
        documents: []
      };

      // Log do lead WhatsApp
      console.log('📱 Salvando lead via WhatsApp:', newLead);
      console.log('📊 Tracking data incluído:', trackingData);
      leads.push(newLead);
      localStorage.setItem('sos-leads', JSON.stringify(leads));
      console.log('✅ Lead WhatsApp salvo! Total:', leads.length);
      toast.success("Dados salvos! Redirecionando para WhatsApp...");

      // Fechar dialog e redirecionar
      setIsWhatsappDialogOpen(false);
      setTimeout(() => {
        const message = encodeURIComponent(`Olá! Meu nome é ${whatsappFormData.name}, meu telefone é ${whatsappFormData.phone}. Tenho uma dúvida sobre uma multa${whatsappFormData.violationType ? ` por ${whatsappFormData.violationType}` : ''}. Poderiam me ajudar?`);
        window.open(`https://wa.me/5551999999999?text=${message}`, '_blank');
      }, 1000);

      // Limpar formulário
      setWhatsappFormData({
        name: "",
        email: "",
        phone: "",
        violationType: ""
      });
    } catch (error) {
      console.error('❌ Erro ao salvar lead WhatsApp:', error);
      toast.error("Erro ao enviar dados. Tente novamente.");
    }
  };
  const selectViolationType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      violationType: type
    }));
    scrollToForm();
  };
  return <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img src="/lovable-uploads/a07a1208-5b54-4395-9bc1-66dd1b69b39d.png" alt="SOS Multas - Assessoria de Trânsito" className="h-12" />
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
            <button 
              className="shake cursor-pointer border-0 outline-none"
              style={{
                borderRadius: '0',
                background: 'transparent url(/lovable-uploads/c45dac41-8b04-49b4-ac99-7529c88b1d75.png) center center no-repeat',
                boxShadow: 'none',
                width: '60px',
                height: '61px',
                backgroundSize: '60px 60px',
                border: '0'
              }}
            />
          </DialogTrigger>
          <DialogContent 
            className="fixed bottom-20 right-6 w-80 max-w-none p-0 border-0 shadow-2xl rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ece5dd 0%, #ddd5cc 100%)',
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(0,0,0,0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(0,0,0,0.05) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(0,0,0,0.02) 0%, transparent 50%)
              `
            }}
          >
            {/* Header do WhatsApp */}
            <div className="bg-[#128C7E] text-white p-3 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/lovable-uploads/a07a1208-5b54-4395-9bc1-66dd1b69b39d.png" alt="SOS Multas" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">SOS Multas</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  Online
                </p>
              </div>
            </div>

            {/* Conversa simulada */}
            <div className="p-4 min-h-[320px] max-h-[400px] overflow-y-auto space-y-3">
              {/* Mensagem da empresa */}
              <div className="flex justify-start">
                <div className="bg-white rounded-md border border-[#cacaca] border-l border-b p-3 max-w-[340px] shadow-sm relative" style={{
                  borderTopStyle: 'none',
                  borderRightStyle: 'none',
                  borderRadius: '6px',
                  alignSelf: 'flex-start'
                }}>
                  <p className="text-sm text-[#4a4a4a] font-['Open_Sans',sans-serif] mb-3">
                    Olá, precisando de um suporte especializado ou de um orçamento sem custo? Me informe seu email e telefone para iniciarmos uma conversa.
                  </p>
                </div>
              </div>

              {/* Formulário como resposta do usuário */}
              <div className="flex justify-end">
                <div className="max-w-[340px] w-full" style={{ alignSelf: 'flex-end' }}>
                  <form onSubmit={handleWhatsappSubmit} className="space-y-2.5">
                    <Input 
                      type="text" 
                      placeholder="Nome *" 
                      value={whatsappFormData.name} 
                      onChange={e => setWhatsappFormData(prev => ({...prev, name: e.target.value}))} 
                      className="w-full h-10 text-sm font-['Open_Sans',sans-serif] text-[#4a4a4a] border border-[#cacaca] rounded-md focus:border-[#cacaca] outline-none"
                      style={{
                        backgroundColor: '#e7ffe7',
                        borderLeftStyle: 'none',
                        borderTopStyle: 'none',
                        borderRightStyle: 'solid',
                        borderBottomStyle: 'solid'
                      }}
                      required 
                    />
                    
                    <Input 
                      type="email" 
                      placeholder="Email *" 
                      value={whatsappFormData.email} 
                      onChange={e => setWhatsappFormData(prev => ({...prev, email: e.target.value}))} 
                      className="w-full h-10 text-sm font-['Open_Sans',sans-serif] text-[#4a4a4a] border border-[#cacaca] rounded-md focus:border-[#cacaca] outline-none"
                      style={{
                        backgroundColor: '#e7ffe7',
                        borderLeftStyle: 'none',
                        borderTopStyle: 'none',
                        borderRightStyle: 'solid',
                        borderBottomStyle: 'solid'
                      }}
                      required 
                    />
                    
                    <Input 
                      type="tel" 
                      placeholder="Telefone *" 
                      value={whatsappFormData.phone} 
                      onChange={e => setWhatsappFormData(prev => ({...prev, phone: e.target.value}))} 
                      className="w-full h-10 text-sm font-['Open_Sans',sans-serif] text-[#4a4a4a] border border-[#cacaca] rounded-md focus:border-[#cacaca] outline-none"
                      style={{
                        backgroundColor: '#e7ffe7',
                        borderLeftStyle: 'none',
                        borderTopStyle: 'none',
                        borderRightStyle: 'solid',
                        borderBottomStyle: 'solid'
                      }}
                      required 
                    />
                    
                    <Select 
                      value={whatsappFormData.violationType} 
                      onValueChange={value => setWhatsappFormData(prev => ({...prev, violationType: value}))}
                    >
                      <SelectTrigger 
                        className="w-full h-10 text-sm font-['Open_Sans',sans-serif] text-[#4a4a4a] border border-[#cacaca] rounded-md focus:border-[#cacaca] outline-none"
                        style={{
                          backgroundColor: '#e7ffe7',
                          borderLeftStyle: 'none',
                          borderTopStyle: 'none',
                          borderRightStyle: 'solid',
                          borderBottomStyle: 'solid'
                        }}
                      >
                        <SelectValue placeholder="Tipo de multa (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excesso de Velocidade">Excesso de Velocidade</SelectItem>
                        <SelectItem value="Excesso de Pontos">Excesso de Pontos</SelectItem>
                        <SelectItem value="Bafômetro">Bafômetro</SelectItem>
                        <SelectItem value="Suspensão da CNH">Suspensão da CNH</SelectItem>
                        <SelectItem value="Cassação da CNH">Cassação da CNH</SelectItem>
                        <SelectItem value="Outra">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                
                    <Button 
                      type="submit" 
                      className="w-full max-w-[150px] h-10 text-white font-['Open_Sans',sans-serif] text-base font-normal rounded-md border-none cursor-pointer flex items-center justify-center self-end"
                      style={{
                        backgroundColor: 'rgba(11,97,86,1)',
                        alignSelf: 'flex-end'
                      }}
                    >
                      Iniciar conversa
                    </Button>
                  </form>
                </div>
              </div>
            </div>
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
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Consultoria Especializada em Defesa de Multas e CNH em Porto Alegre e Região</p>
          <Button onClick={scrollToForm} className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
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
              <p className="text-gray-600 mb-4">Há mais de 15 anos a SOS Multas atua com ética e transparência na defesa dos direitos dos motoristas em Porto Alegre e região. Nossa equipe especializada em Matéria de Trânsito analisa cuidadosamente cada situação para identificar as melhores estratégias para defesa de multas, suspensão e cassação da CNH.</p>
              <p className="text-gray-600 mb-6">Aqui, você conta com profissionais experientes que esclarecem suas dúvidas e realizam uma avaliação gratuita inicial para verificar as possibilidades legais de defesa do seu caso.

Solicite agora mesmo sua análise gratuita!</p>
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
              <img alt="Equipe SOS Multas" src="/lovable-uploads/78d36b32-b682-4d0d-aa1f-ecba95b6ae4a.jpg" className="w-full h-64 rounded-lg object-fill" />
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
                <Input type="text" placeholder="Nome completo *" value={formData.name} onChange={e => setFormData(prev => ({
                ...prev,
                name: e.target.value
              }))} className="w-full p-4 text-lg border-2 focus:border-orange-500" required />
              </div>
              
              <div>
                <Input type="email" placeholder="E-mail *" value={formData.email} onChange={e => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))} className="w-full p-4 text-lg border-2 focus:border-orange-500" required />
              </div>
              
              <div>
                <Input type="tel" placeholder="Telefone com DDD *" value={formData.phone} onChange={e => setFormData(prev => ({
                ...prev,
                phone: e.target.value
              }))} className="w-full p-4 text-lg border-2 focus:border-orange-500" required />
              </div>
              
              <div>
                <Select value={formData.violationType} onValueChange={value => setFormData(prev => ({
                ...prev,
                violationType: value
              }))}>
                  <SelectTrigger className="w-full p-4 text-lg border-2 focus:border-orange-500">
                    <SelectValue placeholder="Tipo de multa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excesso-velocidade">Excesso de Velocidade</SelectItem>
                    <SelectItem value="excesso-pontos">Excesso de Pontos</SelectItem>
                    <SelectItem value="bafometro">Bafômetro</SelectItem>
                    <SelectItem value="suspensao">Suspensão</SelectItem>
                    <SelectItem value="cassacao">Cassação</SelectItem>
                    <SelectItem value="outras">Outras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-4 rounded-lg font-semibold">
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
                <p className="text-gray-600 mb-4">Recebeu uma multa e quer recorrer? Nossa equipe analisa detalhadamente cada autuação e identifica possíveis falhas ou irregularidades que possam embasar a defesa.</p>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Tenho esse problema
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => selectViolationType('suspensao')}>
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Defesa Contra Suspensão da CNH</h3>
                <p className="text-gray-600 mb-4">Sua CNH foi suspensa? Atuamos com estratégias assertivas para defender seu direito de continuar dirigindo dentro das possibilidades legais.</p>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Tenho esse problema
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => selectViolationType('cassacao')}>
              <CardContent className="pt-6">
                <Car className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Recurso Contra Cassação da CNH </h3>
                <p className="text-gray-600 mb-4">Caso sua CNH esteja em risco de cassação, nossa equipe especializada atua rapidamente para proteger seu direito de dirigir, oferecendo recursos bem fundamentados.</p>
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
              <AccordionTrigger className="text-left">Quanto tempo demora o recurso contra CNH suspensa ou cassada?</AccordionTrigger>
              <AccordionContent>
                Em média, um processo de defesa contra suspensão ou cassação da CNH pode durar entre 60 e 180 dias, 
                dependendo do órgão responsável e da complexidade do caso. Durante esse tempo, a SOS Multas atua com 
                agilidade e mantém você informado sobre cada avanço do processo.
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
            {[{
            city: "Porto Alegre",
            address: "Av. Assis Brasil, 3688 - Jardim Lindóia",
            phone: "(51) 3307-7772"
          }, {
            city: "Capão da Canoa",
            address: "R. Tupinambá, 749 - CENTRO, Capão da Canoa - RS, 95555-000",
            phone: "(51) 3665-5226"
          }, {
            city: "Florianópolis",
            address: "Atendimento online",
            phone: "(51) 3307-7772"
          }, {
            city: "Curitiba",
            address: "Atendimento online",
            phone: "(41) 99265-6042"
          }].map((unit, index) => <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{unit.city}</h3>
                  <p className="text-gray-600 text-sm mb-3">{unit.address}</p>
                  <div className="flex items-center justify-center gap-2 text-orange-500">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-semibold">{unit.phone}</span>
                  </div>
                </CardContent>
              </Card>)}
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
                <span>sosmultaspoa@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span>(51) 3307-7772
              </span>
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
                Av. Assis Brasil, 3688<br />
                Jardim Lindóia - Porto Alegre/RS<br />
                CEP: 91010-003
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SOS Multas Porto Alegre. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
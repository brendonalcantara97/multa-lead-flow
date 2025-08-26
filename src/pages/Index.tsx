import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Scale, Shield, Car, MapPin, Phone, Mail, Star, Users, Award, Settings } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import homemBrasileiro from "@/assets/homem-brasileiro-cnh.jpg";

// Declarações TypeScript para GTM
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    trackLeadEvent?: (eventName: string, leadData: any) => void;
  }
}

// Função para mapear tipos de violação do formulário para enum do banco
const mapViolationTypeToEnum = (violationType: string) => {
  const mapping: { [key: string]: "excesso-velocidade" | "excesso-pontos" | "bafometro" | "suspensao-cnh" | "cassacao-cnh" | "outra" } = {
    'excesso-velocidade': 'excesso-velocidade',
    'Excesso de Velocidade': 'excesso-velocidade',
    'excesso-pontos': 'excesso-pontos',
    'Excesso de Pontos': 'excesso-pontos',
    'bafometro': 'bafometro',
    'Bafômetro': 'bafometro',
    'suspensao': 'suspensao-cnh',
    'Suspensão da CNH': 'suspensao-cnh',
    'cassacao': 'cassacao-cnh',
    'Cassação da CNH': 'cassacao-cnh',
    'outras': 'outra',
    'Outra': 'outra'
  };
  
  return mapping[violationType] || 'outra';
};
// Número do WhatsApp da empresa
const COMPANY_WHATSAPP = "555133077772";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
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
    utm_content: "",
    gclid: "",
    gbraid: "",
    fbp: "",
    fbclid: "",
    ga_client_id: ""
  });
  const handlePhoneChange = (value: string) => {
    // Remove todos os não dígitos
    const numbersOnly = value.replace(/\D/g, '');

    // Limita a 11 dígitos (DD9XXXXYYYY)
    const limitedNumbers = numbersOnly.slice(0, 11);

    // Aplica máscara DD9XXXX-YYYY
    let formattedValue = '';
    if (limitedNumbers.length > 7) {
      formattedValue = `${limitedNumbers.slice(0, 7)}-${limitedNumbers.slice(7)}`;
    } else {
      formattedValue = limitedNumbers;
    }
    return formattedValue;
  };
  useEffect(() => {
    // Capturar parâmetros de tracking completos
    const urlParams = new URLSearchParams(window.location.search);
    const trackingInfo = {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_term: urlParams.get('utm_term') || '',
      utm_content: urlParams.get('utm_content') || '',
      gclid: urlParams.get('gclid') || '',
      gbraid: urlParams.get('gbraid') || '',
      fbp: localStorage.getItem('_fbp') || getCookie('_fbp') || '',
      fbclid: urlParams.get('fbclid') || getCookie('_fbc') || '',
      ga_client_id: getCookie('_ga') || ''
    };
    setTrackingData(trackingInfo);

    // Log para debug - mostrar dados capturados
    console.log('🔍 Dados de tracking capturados:', trackingInfo);
    console.log('📊 URL atual:', window.location.href);
    console.log('🍪 Cookies disponíveis:', document.cookie);

    // Disparar evento GTM de page view com parâmetros
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'SOS Multas - Home',
        page_location: window.location.href,
        utm_source: trackingInfo.utm_source,
        utm_medium: trackingInfo.utm_medium,
        utm_campaign: trackingInfo.utm_campaign,
        gclid: trackingInfo.gclid,
        fbp: trackingInfo.fbp
      });
    }

    console.log('📊 Dados de tracking capturados:', trackingInfo);
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
      // Se usuário não estiver logado, salvar no localStorage (modo de demonstração)
      if (!user) {
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

        console.log('💾 Salvando novo lead no localStorage:', newLead);
        leads.push(newLead);
        localStorage.setItem('sos-leads', JSON.stringify(leads));
        console.log('✅ Lead salvo no localStorage! Total de leads:', leads.length);
      } else {
        // Se usuário está logado, salvar no Supabase
        const { data: sourceData, error: sourceError } = await supabase.rpc('get_or_create_lead_source', {
          p_utm_source: trackingData.utm_source || null,
          p_utm_medium: trackingData.utm_medium || null,
          p_utm_campaign: trackingData.utm_campaign || null,
          p_utm_term: trackingData.utm_term || null,
          p_utm_content: trackingData.utm_content || null,
          p_gclid: trackingData.gclid || null,
          p_gbraid: trackingData.gbraid || null,
          p_fbp: trackingData.fbp || null,
          p_fbclid: trackingData.fbclid || null
        });

        if (sourceError) {
          console.error('Erro ao criar/buscar fonte:', sourceError);
          throw sourceError;
        }

        const { error: leadError } = await supabase.from('leads').insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          violation_type: mapViolationTypeToEnum(formData.violationType),
          lead_source_id: sourceData,
          lead_origin: 'website',
          observations: 'Lead capturado via formulário principal do site'
        });

        if (leadError) {
          console.error('Erro ao salvar lead:', leadError);
          throw leadError;
        }

        console.log('✅ Lead salvo no Supabase com sucesso!');
        
        // Disparar evento GTM de conversão
        if (window.trackLeadEvent) {
          window.trackLeadEvent('lead_form_submission', {
            ...formData,
            ...trackingData,
            form_type: 'main_form'
          });
        }
      }

      toast.success("Dados enviados com sucesso! Redirecionando para WhatsApp...");

      // Redirecionar para WhatsApp após 2 segundos
      setTimeout(() => {
        const message = encodeURIComponent(`Olá! Preenchi o formulário no site da SOS Multas e gostaria de receber ajuda com a minha multa.`);
        window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${message}`, '_blank');
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
      // Se usuário não estiver logado, salvar no localStorage (modo de demonstração)
      if (!user) {
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

        console.log('📱 Salvando lead via WhatsApp no localStorage:', newLead);
        leads.push(newLead);
        localStorage.setItem('sos-leads', JSON.stringify(leads));
        console.log('✅ Lead WhatsApp salvo no localStorage! Total:', leads.length);
      } else {
        // Se usuário está logado, salvar no Supabase
        const { data: sourceData, error: sourceError } = await supabase.rpc('get_or_create_lead_source', {
          p_utm_source: trackingData.utm_source || null,
          p_utm_medium: trackingData.utm_medium || null,
          p_utm_campaign: trackingData.utm_campaign || null,
          p_utm_term: trackingData.utm_term || null,
          p_utm_content: trackingData.utm_content || null,
          p_gclid: trackingData.gclid || null,
          p_gbraid: trackingData.gbraid || null,
          p_fbp: trackingData.fbp || null,
          p_fbclid: trackingData.fbclid || null
        });

        if (sourceError) {
          console.error('Erro ao criar/buscar fonte WhatsApp:', sourceError);
          throw sourceError;
        }

        const { error: leadError } = await supabase.from('leads').insert({
          user_id: user.id,
          name: whatsappFormData.name,
          email: whatsappFormData.email,
          phone: whatsappFormData.phone,
          violation_type: mapViolationTypeToEnum(whatsappFormData.violationType),
          lead_source_id: sourceData,
          lead_origin: 'whatsapp',
          observations: 'Lead capturado via botão WhatsApp do site'
        });

        if (leadError) {
          console.error('Erro ao salvar lead WhatsApp:', leadError);
          throw leadError;
        }

        console.log('✅ Lead WhatsApp salvo no Supabase com sucesso!');
        
        // Disparar evento GTM de conversão WhatsApp
        if (window.trackLeadEvent) {
          window.trackLeadEvent('whatsapp_lead_submission', {
            ...whatsappFormData,
            ...trackingData,
            form_type: 'whatsapp_form'
          });
        }
      }

      toast.success("Dados salvos! Redirecionando para WhatsApp...");

      // Fechar dialog e redirecionar
      setIsWhatsappDialogOpen(false);
      setTimeout(() => {
        const message = encodeURIComponent(`Olá! Meu nome é ${whatsappFormData.name}. Tenho uma dúvida sobre uma multa${whatsappFormData.violationType ? ` por ${whatsappFormData.violationType}` : ""}. Poderiam me ajudar?`);
        window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${message}`, '_blank');
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
            <a href="#unidades" className="text-gray-700 hover:text-orange-500 transition-colors">Unidades</a>
            <a href="#contato" className="text-gray-700 hover:text-orange-500 transition-colors">Contato</a>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Olá, {user.user_metadata?.first_name || user.email}
                </span>
                <Button 
                  onClick={() => navigate('/crm')}
                  variant="outline" 
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  CRM
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* WhatsApp Float Button with Dialog */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen}>
          <DialogTrigger asChild>
            <button className="shake cursor-pointer border-0 outline-none" style={{
            borderRadius: '0',
            background: 'transparent url(/lovable-uploads/c45dac41-8b04-49b4-ac99-7529c88b1d75.png) center center no-repeat',
            boxShadow: 'none',
            width: '60px',
            height: '61px',
            backgroundSize: '60px 60px',
            border: '0'
          }} />
          </DialogTrigger>
          <DialogContent className="fixed bottom-20 right-6 w-auto max-w-none p-0 border-0 h-auto" style={{
          width: '320px',
          height: '480px',
          borderRadius: '12px',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
          background: '#ECE5DD',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 0h50v50H0z'/%3E%3Cpath d='M10 10h30v30H10zM0 0h10v10H0zM40 0h10v10H40zM0 40h10v10H0zM40 40h10v10H40z' fill-opacity='0.02'/%3E%3C/g%3E%3C/svg%3E")`
        }}>
            {/* Header do WhatsApp */}
            <div style={{
            backgroundColor: '#25D366'
          }} className="text-white p-3 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/lovable-uploads/a07a1208-5b54-4395-9bc1-66dd1b69b39d.png" alt="SOS Multas" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">SOS Multas</h3>
                  <p className="text-xs flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{
                    backgroundColor: '#25D366'
                  }}></div>
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsWhatsappDialogOpen(false)} className="text-white hover:bg-green-700 p-1 rounded transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Conversa simulada */}
            <div className="p-3 space-y-3 pb-2">
              {/* Mensagem da empresa */}
              <div className="flex justify-start">
                <div className="bg-white rounded-md border border-[#cacaca] border-l border-b p-3 max-w-[340px] shadow-sm relative" style={{
                borderTopStyle: 'none',
                borderRightStyle: 'none',
                borderRadius: '6px',
                alignSelf: 'flex-start'
              }}>
                  <p className="text-sm text-[#4a4a4a] font-['Open_Sans',sans-serif] mb-3">Olá Seja bem-vindo(a) SOS MULTAS👋, me informe seus dados para iniciarmos uma conversa e analisarmos seu caso.</p>
                </div>
              </div>

              {/* Formulário como resposta do usuário */}
              <div className="flex justify-end">
                <div className="max-w-[340px] w-full" style={{
                alignSelf: 'flex-end'
              }}>
                  <form onSubmit={handleWhatsappSubmit} className="space-y-2.5 pb-6 px-1">
                    <Input type="text" placeholder="Nome *" value={whatsappFormData.name} onChange={e => setWhatsappFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))} className="w-full h-10 text-sm text-[#4a4a4a] border border-[#cacaca] rounded-md focus:border-[#25D366] outline-none" style={{
                    backgroundColor: '#DCF8C6',
                    fontFamily: 'Open Sans, sans-serif'
                  }} required />
                    
                    <Input type="email" placeholder="Email *" value={whatsappFormData.email} onChange={e => setWhatsappFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))} className="w-full h-10 text-sm text-[#4a4a4a] border border-[#cacaca] rounded-md focus:border-[#25D366] outline-none" style={{
                    backgroundColor: '#DCF8C6',
                    fontFamily: 'Open Sans, sans-serif'
                  }} required />
                    
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-md border border-[#cacaca]" style={{
                      backgroundColor: '#DCF8C6'
                    }}>
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="16" fill="#009739" />
                          <path d="M12 2L20 8L12 14L4 8L12 2Z" fill="#FFDF00" />
                          <circle cx="12" cy="8" r="3.2" fill="#002776" />
                          <circle cx="10.5" cy="5.5" r="0.15" fill="#FFDF00" />
                          <circle cx="13.5" cy="5.5" r="0.15" fill="#FFDF00" />
                          <circle cx="11" cy="6.2" r="0.1" fill="#FFDF00" />
                          <circle cx="13" cy="6.2" r="0.1" fill="#FFDF00" />
                          <circle cx="12" cy="5.8" r="0.12" fill="#FFDF00" />
                          <circle cx="10.2" cy="9.5" r="0.1" fill="#FFDF00" />
                          <circle cx="13.8" cy="9.5" r="0.1" fill="#FFDF00" />
                          <circle cx="11.5" cy="10" r="0.08" fill="#FFDF00" />
                          <circle cx="12.5" cy="10" r="0.08" fill="#FFDF00" />
                        </svg>
                        <span className="ml-2 text-sm text-[#4a4a4a]">+55</span>
                      </div>
                      <Input type="tel" placeholder="Whatsappp" value={whatsappFormData.phone} onChange={e => setWhatsappFormData(prev => ({
                      ...prev,
                      phone: handlePhoneChange(e.target.value)
                    }))} className="flex-1 h-10 text-sm text-[#4a4a4a] border border-[#cacaca] rounded-md focus:border-[#25D366] outline-none" style={{
                      backgroundColor: '#DCF8C6',
                      fontFamily: 'Open Sans, sans-serif'
                    }} required />
                    </div>
                    
                    <Select value={whatsappFormData.violationType} onValueChange={value => setWhatsappFormData(prev => ({
                    ...prev,
                    violationType: value
                  }))}>
                      <SelectTrigger className="w-full h-10 text-sm text-[#4a4a4a] border border-[#cacaca] rounded-md focus:border-[#25D366] outline-none" style={{
                      backgroundColor: '#DCF8C6',
                      fontFamily: 'Open Sans, sans-serif'
                    }}>
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
                
                    <Button type="submit" className="w-full max-w-full py-2 px-4 mt-4 text-white text-base font-normal rounded-md border-none cursor-pointer transition-colors duration-300 hover:opacity-90" style={{
                    backgroundColor: '#075E54',
                    fontFamily: 'Open Sans, sans-serif',
                    boxSizing: 'border-box'
                  }}>
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
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Consultoria especializada em defesa de multas em Porto Alegre e Região</p>
          <Button onClick={scrollToForm} className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
            Fazer minha análise gratuita
          </Button>
        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">
                <span className="text-orange-500">Consulte</span> gratuitamente a situação da sua <span className="text-orange-500">CNH</span>
              </h2>
              <p className="text-gray-200 mb-4 text-lg">
                Ao solicitar orçamento no botão abaixo, você garante uma <strong className="text-orange-500">análise totalmente gratuita</strong> da sua carteira de motorista.
              </p>
              <p className="text-gray-200 mb-8 text-lg">
                Nossa equipe especializada está pronta para responder com agilidade, tirar suas dúvidas e orientar você na solução de qualquer problema relacionado à sua CNH, multas, suspensão ou cassação.
              </p>
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold text-white">15+ anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold text-white">4.8/5 Google</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold text-white">5000+ casos</span>
                </div>
              </div>
              <Button onClick={scrollToForm} className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">
                Faça sua Análise Gratuita
              </Button>
            </div>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full transform rotate-12 scale-105"></div>
                <img alt="Especialista SOS Multas com CNH" src="/lovable-uploads/3e65e133-2408-4008-af8c-a86230f7b800.png" className="relative w-80 h-80 rounded-full object-cover border-4 border-white shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Conversão */}
      <section id="form-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-black mb-2">Análise Gratuita da sua MULTA ou CNH</h2>
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
                <Input type="tel" placeholder="Whatsapp" value={formData.phone} onChange={e => setFormData(prev => ({
                ...prev,
                phone: handlePhoneChange(e.target.value)
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
              
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base md:text-lg py-3 md:py-4 rounded-md md:rounded-lg font-semibold">
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

      {/* Sobre a SOS Multas */}
      <section id="sobre-empresa" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-black mb-10">Sobre a SOS Multas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg h-full">
              <h3 className="text-xl font-bold text-black mb-4">Sobre a SOS Multas</h3>
              <p className="text-gray-700 text-base leading-relaxed">
                A <strong className="text-orange-500">SOS MULTAS - Assessoria de Trânsito</strong>, surgiu em 2007 para, de forma responsável, garantir a manutenção do direito de dirigir dos seus clientes. Com profissionais qualificados, a empresa atua em defesas e recursos contra multas de trânsito. Desde as multas mais brandas às que acarretam as penalidades de suspensão e cassação da CNH (excesso de pontos, excesso de velocidade, bafômetro, entre outras penalidades).
              </p>
              <p className="text-gray-700 text-base leading-relaxed mt-4">
                Ao longo da sua trajetória a SOS MULTAS adquiriu credibilidade e tornou-se referência em assessoria de trânsito no Rio Grande do Sul e em Santa Catarina, tanto para seus clientes como para prestadores de outros serviços relacionados ao trânsito.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg h-full">
              <h3 className="text-xl font-bold text-black mb-4">Nossa Missão</h3>
              <p className="text-gray-700 text-base leading-relaxed mb-3">
                A defesa do <strong className="text-orange-500">DIREITO DE DIRIGIR</strong> do cidadão e o combate às ilegalidades e injustiças são nossa maior bandeira.
              </p>
              <p className="text-gray-700 text-base leading-relaxed mb-3">
                A SOS Multas atua há mais de 15 anos na orientação administrativa de motoristas em todo o Brasil, sempre em conformidade com a legislação vigente.
              </p>
              <p className="text-gray-700 text-base leading-relaxed mb-3">
                Nossa missão é prestar assessoria ética e transparente para condutores que buscam apoio em processos de suspensão, cassação e recursos administrativos relacionados ao direito de dirigir. A SOS Multas é uma empresa privada, sem qualquer vínculo com órgãos públicos de trânsito.
              </p>
              <p className="text-gray-700 text-base leading-relaxed">
                Todas as orientações são realizadas de forma personalizada, e a decisão final sobre cada caso cabe exclusivamente à autoridade competente.
              </p>
            </div>
          </div>
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
                
                <li><a href="/auth" className="hover:text-orange-500 transition-colors">Área Restrita</a></li>
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
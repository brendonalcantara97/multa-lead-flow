import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  className?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = "5551999999999", // Substitua pelo número real da SOS Multas
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipoMulta: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.nome || !formData.telefone) {
      alert('Por favor, preencha pelo menos o nome e telefone.');
      return;
    }

    // Criar mensagem para WhatsApp
    const message = `Olá! Preciso de ajuda com multa de trânsito.\n\n*Dados do contato:*\nNome: ${formData.nome}\nEmail: ${formData.email || 'Não informado'}\nTelefone: ${formData.telefone}\nTipo de multa: ${formData.tipoMulta || 'Não especificado'}\n\nAguardo retorno para análise do meu caso.`;

    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Fechar modal
    setIsModalOpen(false);

    // Limpar formulário
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      tipoMulta: '',
    });
  };

  return (
    <>
      {/* Botão flutuante do WhatsApp */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 ${className}`}
        aria-label="Abrir WhatsApp"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
        </svg>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto"
          >
            {/* Header do modal */}
            <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">SOS</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">SOS Multas</h3>
                  <p className="text-sm opacity-90">● Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-green-600 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.1'%3E%3Cpath d='m0 40l40-40v40zm40 0v-40l-40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-gray-700 text-sm">
                  Olá! Está com dúvidas sobre multas ou problemas na CNH?<br/>
                  Nossa equipe está pronta para te ajudar com uma avaliação gratuita e orientações especializadas.<br/>
                  Preencha seus dados para começarmos a conversa.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="nome"
                    placeholder="Nome *"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center bg-green-50 px-3 rounded-lg border border-gray-300">
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                      <rect width="20" height="14" fill="#009739"/>
                      <rect y="4.67" width="20" height="4.67" fill="#FFDF00"/>
                      <rect y="9.33" width="20" height="4.67" fill="#002776"/>
                    </svg>
                    <span className="ml-2 text-sm">+55</span>
                  </div>
                  <input
                    type="tel"
                    name="telefone"
                    placeholder="Telefone *"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                    required
                  />
                </div>

                <div>
                  <select
                    name="tipoMulta"
                    value={formData.tipoMulta}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                  >
                    <option value="">Tipo da Multa *</option>
                    <option value="velocidade">Excesso de velocidade</option>
                    <option value="alcool">Lei Seca</option>
                    <option value="documento">Documento vencido</option>
                    <option value="outra">Outra</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Iniciar conversa
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
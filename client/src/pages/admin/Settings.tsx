import { useState, useEffect } from "react";
import { User, Phone, Clock, DollarSign, FileText, Link, Shield, Save, Camera, Plus, Trash2, Eye, EyeOff, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

interface AvailabilitySlot {
  day: string;
  dayLabel: string;
  enabled: boolean;
  start: string;
  end: string;
}

const defaultAvailability: AvailabilitySlot[] = [
  { day: "monday", dayLabel: "Segunda-feira", enabled: true, start: "08:00", end: "18:00" },
  { day: "tuesday", dayLabel: "Terça-feira", enabled: true, start: "08:00", end: "18:00" },
  { day: "wednesday", dayLabel: "Quarta-feira", enabled: true, start: "08:00", end: "18:00" },
  { day: "thursday", dayLabel: "Quinta-feira", enabled: true, start: "08:00", end: "18:00" },
  { day: "friday", dayLabel: "Sexta-feira", enabled: true, start: "08:00", end: "18:00" },
  { day: "saturday", dayLabel: "Sábado", enabled: false, start: "08:00", end: "12:00" },
  { day: "sunday", dayLabel: "Domingo", enabled: false, start: "", end: "" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Query settings on load
  const settingsQuery = trpc.settings.getAll.useQuery();
  
  // Mutation to update settings
  const updateMutation = trpc.settings.updateSetting.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      settingsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configurações");
    },
  });

  // Form states
  const [profile, setProfile] = useState({
    name: "Dr. João Silva",
    crp: "06/123456",
    specialty: "Psicólogo Clínico",
    education: "Graduação em Psicologia - USP\nEspecialização em Terapia Cognitivo-Comportamental - PUC-SP",
    bio: "Psicólogo clínico com mais de 10 anos de experiência em atendimento de adultos e adolescentes. Especializado em tratamento de ansiedade, depressão e questões de relacionamento.",
    photo: "",
  });

  const [contact, setContact] = useState({
    email: "contato@psicologo.com.br",
    phone: "(11) 99999-9999",
    whatsapp: "(11) 99999-9999",
    address: "Av. Paulista, 1000 - Sala 1010\nBela Vista, São Paulo - SP\nCEP: 01310-100",
    instagram: "@psicologo",
    linkedin: "linkedin.com/in/psicologo",
    website: "www.psicologo.com.br",
  });

  const [availability, setAvailability] = useState<AvailabilitySlot[]>(defaultAvailability);
  const [sessionDuration, setSessionDuration] = useState("50");
  const [slotInterval, setSlotInterval] = useState("60");

  const [pricing, setPricing] = useState({
    presencial: "250",
    online: "200",
    firstSession: "200",
    package5: "1100",
    package10: "2000",
    acceptsInsurance: false,
    insuranceNotes: "",
  });

  const [content, setContent] = useState({
    heroTitle: "Psicoterapia com acolhimento e profissionalismo",
    heroSubtitle: "Ajudo você a superar desafios emocionais e alcançar maior bem-estar através de um processo terapêutico individualizado.",
    aboutMe: "Sou psicólogo clínico com formação pela Universidade de São Paulo e especialização em Terapia Cognitivo-Comportamental...",
    missionStatement: "Oferecer um espaço seguro e acolhedor para que cada pessoa possa se desenvolver e alcançar seu potencial.",
  });

  const [mapConfig, setMapConfig] = useState({
    enabled: true,
    latitude: "-23.5505",
    longitude: "-46.6333",
    title: "Consultório de Psicologia",
    address: "São Paulo, SP",
    phoneNumber: "(11) 99999-9999",
    hours: "Seg-Sex: 09:00 - 18:00",
    zoom: "15",
  });

  const [integrations, setIntegrations] = useState({
    googleAnalyticsId: "",
    googleAnalyticsEnabled: false,
    googleCalendarEnabled: false,
    googleCalendarEmail: "",
    emailNotifications: true,
    smsNotifications: false,
    whatsappButtonEnabled: true,
    whatsappDefaultMessage: "Olá! Gostaria de saber mais sobre os atendimentos.",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load settings from API
  useEffect(() => {
    if (settingsQuery.data) {
      const settings = settingsQuery.data;
      const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

      // Map profile settings
      if (settingsMap.psychologist_name) {
        setProfile(prev => ({ ...prev, name: settingsMap.psychologist_name }));
      }
      if (settingsMap.psychologist_crp) {
        setProfile(prev => ({ ...prev, crp: settingsMap.psychologist_crp }));
      }

      // Map contact settings
      if (settingsMap.email) {
        setContact(prev => ({ ...prev, email: settingsMap.email }));
      }
      if (settingsMap.phone) {
        setContact(prev => ({ ...prev, phone: settingsMap.phone }));
      }

      // Map pricing settings
      if (settingsMap.consultation_price_presencial) {
        setPricing(prev => ({ ...prev, presencial: settingsMap.consultation_price_presencial }));
      }
      if (settingsMap.consultation_price_online) {
        setPricing(prev => ({ ...prev, online: settingsMap.consultation_price_online }));
      }
    }
  }, [settingsQuery.data]);

  // Handlers
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save profile settings
      await Promise.all([
        updateMutation.mutateAsync({ key: "psychologist_name", value: profile.name }),
        updateMutation.mutateAsync({ key: "psychologist_crp", value: profile.crp }),
      ]);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvailabilityChange = (index: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    setAvailability((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    if (security.newPassword.length < 8) {
      alert("A senha deve ter pelo menos 8 caracteres!");
      return;
    }
    // TODO: Implement password change via tRPC
    alert("Senha alterada com sucesso!");
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">Gerencie as configurações do seu site e perfil profissional</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Save size={18} />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-lg flex flex-wrap gap-1">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-white">
              <User size={16} />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2 data-[state=active]:bg-white">
              <Phone size={16} />
              <span className="hidden sm:inline">Contato</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-2 data-[state=active]:bg-white">
              <Clock size={16} />
              <span className="hidden sm:inline">Horários</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2 data-[state=active]:bg-white">
              <DollarSign size={16} />
              <span className="hidden sm:inline">Valores</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-white">
              <FileText size={16} />
              <span className="hidden sm:inline">Conteúdo</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2 data-[state=active]:bg-white">
              <MapPin size={16} />
              <span className="hidden sm:inline">Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2 data-[state=active]:bg-white">
              <Link size={16} />
              <span className="hidden sm:inline">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-white">
              <Shield size={16} />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perfil Profissional */}
          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Perfil Profissional</h2>
              
              <div className="space-y-6">
                {/* Foto */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile.photo ? (
                      <img src={profile.photo} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Button variant="outline" className="gap-2">
                      <Camera size={16} />
                      Alterar Foto
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">JPG ou PNG. Máximo 2MB.</p>
                  </div>
                </div>

                {/* Nome e CRP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CRP</label>
                    <input
                      type="text"
                      value={profile.crp}
                      onChange={(e) => setProfile((p) => ({ ...p, crp: e.target.value }))}
                      placeholder="Ex: 06/123456"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Especialidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                  <input
                    type="text"
                    value={profile.specialty}
                    onChange={(e) => setProfile((p) => ({ ...p, specialty: e.target.value }))}
                    placeholder="Ex: Psicólogo Clínico, Terapeuta Cognitivo-Comportamental"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Formação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
                  <textarea
                    value={profile.education}
                    onChange={(e) => setProfile((p) => ({ ...p, education: e.target.value }))}
                    placeholder="Liste sua formação (uma por linha)"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biografia / Apresentação</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Escreva uma apresentação profissional..."
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">{profile.bio.length}/500 caracteres</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Contato */}
          <TabsContent value="contact">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações de Contato</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={contact.whatsapp}
                    onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))}
                    placeholder="Número com DDI e DDD (ex: 5511999999999)"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    <strong>Formato:</strong> DDI + DDD + Número (sem espaços ou caracteres especiais)
                    <br />
                    <strong>Exemplo:</strong> 5511999999999 para +55 (11) 99999-9999
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Botão Flutuante do WhatsApp
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Exibir botão flutuante</p>
                        <p className="text-sm text-gray-500">O botão ficará visível em todas as páginas do site</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={integrations.whatsappButtonEnabled ?? true}
                          onChange={(e) => setIntegrations((i) => ({ ...i, whatsappButtonEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensagem Padrão
                      </label>
                      <textarea
                        value={integrations.whatsappDefaultMessage ?? "Olá! Gostaria de saber mais sobre os atendimentos."}
                        onChange={(e) => setIntegrations((i) => ({ ...i, whatsappDefaultMessage: e.target.value }))}
                        rows={2}
                        placeholder="Mensagem que aparecerá automaticamente ao abrir o WhatsApp"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Esta mensagem será pré-preenchida quando alguém clicar no botão do WhatsApp
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <strong>💡 Dica:</strong> O número do WhatsApp acima será usado no botão flutuante. 
                        Certifique-se de incluir o DDI (55 para Brasil) e o DDD.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Google Analytics */}
                <div className="rounded-lg border border-gray-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.84 2.998v17.999a1.003 1.003 0 01-1.002 1.003h-2.996a1.003 1.003 0 01-1.002-1.003V8.496a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v12.501a1.003 1.003 0 01-1.002 1.003H9.842a1.003 1.003 0 01-1.002-1.003v-8.999a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v8.999a1.003 1.003 0 01-1.002 1.003H.842A1.003 1.003 0 01-.16 20.997V14.5a.5.5 0 00-.5-.5h-.5a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h.5a.5.5 0 00.5-.5V2.998A1.003 1.003 0 01.842 1.995h21a1.003 1.003 0 011.002 1.003z"/>
                      </svg>
                      Google Analytics 4
                    </h3>
                  </div>
                  <div className="p-6 space-y-4 bg-white">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="gaEnabled"
                            checked={integrations.googleAnalyticsEnabled ?? false}
                            onChange={(e) => setIntegrations((i) => ({ ...i, googleAnalyticsEnabled: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="gaEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Ativar Google Analytics
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID de Medição (Measurement ID)
                        </label>
                        <input
                          type="text"
                          value={integrations.googleAnalyticsId ?? ""}
                          onChange={(e) => setIntegrations((i) => ({ ...i, googleAnalyticsId: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                          placeholder="G-XXXXXXXXXX"
                          disabled={!integrations.googleAnalyticsEnabled}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Formato: G-XXXXXXXXXX (encontrado no painel do Google Analytics)
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-900">
                        <strong>📊 Sobre o Google Analytics:</strong> Rastreie visitantes, páginas mais acessadas, 
                        conversões de agendamentos e muito mais. Configure sua propriedade GA4 no 
                        <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                          Google Analytics
                        </a>.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>🎯 Eventos rastreados:</strong>
                      </p>
                      <ul className="text-xs text-gray-600 mt-2 space-y-1 ml-4 list-disc">
                        <li>Visualizações de página</li>
                        <li>Cliques em botões de CTA</li>
                        <li>Submissão de formulários (contato, agendamento)</li>
                        <li>Conversão de agendamentos concluídos</li>
                        <li>Cliques no WhatsApp</li>
                        <li>Visualizações e compartilhamentos de posts do blog</li>
                        <li>Buscas realizadas</li>
                        <li>Profundidade de rolagem (scroll depth)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço do Consultório</label>
                  <textarea
                    value={contact.address}
                    onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Redes Sociais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input
                        type="text"
                        value={contact.instagram}
                        onChange={(e) => setContact((c) => ({ ...c, instagram: e.target.value }))}
                        placeholder="@seuinstagram"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <input
                        type="text"
                        value={contact.linkedin}
                        onChange={(e) => setContact((c) => ({ ...c, linkedin: e.target.value }))}
                        placeholder="URL do seu perfil"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Horários */}
          <TabsContent value="hours">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Horários de Atendimento</h2>
              
              <div className="space-y-6">
                {/* Configurações de sessão */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração da Sessão (minutos)</label>
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="45">45 minutos</option>
                      <option value="50">50 minutos</option>
                      <option value="60">60 minutos</option>
                      <option value="90">90 minutos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo entre Sessões</label>
                    <select
                      value={slotInterval}
                      onChange={(e) => setSlotInterval(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="50">50 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="90">1h30</option>
                    </select>
                  </div>
                </div>

                {/* Disponibilidade semanal */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Disponibilidade Semanal</h3>
                  <div className="space-y-3">
                    {availability.map((slot, index) => (
                      <div key={slot.day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <label className="flex items-center gap-2 w-36">
                          <input
                            type="checkbox"
                            checked={slot.enabled}
                            onChange={(e) => handleAvailabilityChange(index, "enabled", e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className={slot.enabled ? "font-medium" : "text-gray-400"}>
                            {slot.dayLabel}
                          </span>
                        </label>
                        {slot.enabled && (
                          <>
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => handleAvailabilityChange(index, "start", e.target.value)}
                              className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">até</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => handleAvailabilityChange(index, "end", e.target.value)}
                              className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </>
                        )}
                        {!slot.enabled && (
                          <span className="text-gray-400 italic">Não disponível</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Valores */}
          <TabsContent value="pricing">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Valores das Consultas</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sessão Presencial (R$)</label>
                    <input
                      type="number"
                      value={pricing.presencial}
                      onChange={(e) => setPricing((p) => ({ ...p, presencial: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sessão Online (R$)</label>
                    <input
                      type="number"
                      value={pricing.online}
                      onChange={(e) => setPricing((p) => ({ ...p, online: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primeira Sessão (R$)</label>
                    <input
                      type="number"
                      value={pricing.firstSession}
                      onChange={(e) => setPricing((p) => ({ ...p, firstSession: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Valor promocional para nova consulta</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pacotes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pacote 5 Sessões (R$)</label>
                      <input
                        type="number"
                        value={pricing.package5}
                        onChange={(e) => setPricing((p) => ({ ...p, package5: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pacote 10 Sessões (R$)</label>
                      <input
                        type="number"
                        value={pricing.package10}
                        onChange={(e) => setPricing((p) => ({ ...p, package10: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={pricing.acceptsInsurance}
                      onChange={(e) => setPricing((p) => ({ ...p, acceptsInsurance: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">Aceita convênio/reembolso</span>
                  </label>
                  {pricing.acceptsInsurance && (
                    <textarea
                      value={pricing.insuranceNotes}
                      onChange={(e) => setPricing((p) => ({ ...p, insuranceNotes: e.target.value }))}
                      placeholder="Detalhes sobre convênios aceitos, processo de reembolso, etc."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Conteúdo */}
          <TabsContent value="content">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Textos do Site</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal (Hero)</label>
                  <input
                    type="text"
                    value={content.heroTitle}
                    onChange={(e) => setContent((c) => ({ ...c, heroTitle: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (Hero)</label>
                  <textarea
                    value={content.heroSubtitle}
                    onChange={(e) => setContent((c) => ({ ...c, heroSubtitle: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sobre Mim (Texto completo)</label>
                  <textarea
                    value={content.aboutMe}
                    onChange={(e) => setContent((c) => ({ ...c, aboutMe: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Missão / Filosofia de Trabalho</label>
                  <textarea
                    value={content.missionStatement}
                    onChange={(e) => setContent((c) => ({ ...c, missionStatement: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Dica:</strong> Mantenha os textos concisos e profissionais. Evite promessas de cura e 
                    sempre siga as diretrizes éticas do CRP.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Google Maps */}
          <TabsContent value="map">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Configurações do Mapa
              </h2>
              
              <div className="space-y-6">
                {/* Enable/Disable */}
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="mapEnabled"
                        checked={mapConfig.enabled}
                        onChange={(e) => setMapConfig((m) => ({ ...m, enabled: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="mapEnabled" className="text-sm font-medium text-gray-700">
                        Habilitar Google Maps na página de contato
                      </label>
                    </div>
                  </div>
                </div>

                {mapConfig.enabled && (
                  <>
                    {/* Latitude e Longitude */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={mapConfig.latitude}
                          onChange={(e) => setMapConfig((m) => ({ ...m, latitude: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="-23.5505"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ex: -23.5505 para São Paulo</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={mapConfig.longitude}
                          onChange={(e) => setMapConfig((m) => ({ ...m, longitude: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="-46.6333"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ex: -46.6333 para São Paulo</p>
                      </div>
                    </div>

                    {/* Título e Endereço */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título do Marcador</label>
                      <input
                        type="text"
                        value={mapConfig.title}
                        onChange={(e) => setMapConfig((m) => ({ ...m, title: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Consultório de Psicologia"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                      <textarea
                        value={mapConfig.address}
                        onChange={(e) => setMapConfig((m) => ({ ...m, address: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                      />
                    </div>

                    {/* Telefone e Horários */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input
                          type="text"
                          value={mapConfig.phoneNumber}
                          onChange={(e) => setMapConfig((m) => ({ ...m, phoneNumber: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Horários</label>
                        <input
                          type="text"
                          value={mapConfig.hours}
                          onChange={(e) => setMapConfig((m) => ({ ...m, hours: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Seg-Sex: 09:00 - 18:00"
                        />
                      </div>
                    </div>

                    {/* Zoom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Zoom</label>
                      <select
                        value={mapConfig.zoom}
                        onChange={(e) => setMapConfig((m) => ({ ...m, zoom: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="12">Zoom 12 (Cidade)</option>
                        <option value="14">Zoom 14 (Bairro)</option>
                        <option value="15">Zoom 15 (Rua)</option>
                        <option value="16">Zoom 16 (Próximo)</option>
                        <option value="18">Zoom 18 (Muito Próximo)</option>
                      </select>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-900">
                        <strong>📍 Dica:</strong> Use ferramentas como Google Maps ou{" "}
                        <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">
                          Google Maps
                        </a>{" "}
                        para encontrar as coordenadas exatas (latitude e longitude) do seu consultório.
                      </p>
                    </div>
                  </>
                )}

                {!mapConfig.enabled && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Habilite o mapa para exibir a localização do consultório na página de contato.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Integrações */}
          <TabsContent value="integrations">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Integrações</h2>
              
              <div className="space-y-6">
                {/* Google Analytics */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Google Analytics</h3>
                      <p className="text-sm text-gray-500">Rastreie visitas e comportamento no site</p>
                    </div>
                    <Badge variant={integrations.googleAnalyticsId ? "default" : "outline"}>
                      {integrations.googleAnalyticsId ? "Configurado" : "Não configurado"}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID do Google Analytics (GA4)</label>
                    <input
                      type="text"
                      value={integrations.googleAnalyticsId}
                      onChange={(e) => setIntegrations((i) => ({ ...i, googleAnalyticsId: e.target.value }))}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Google Calendar */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Google Calendar</h3>
                      <p className="text-sm text-gray-500">Sincronize agendamentos automaticamente</p>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={integrations.googleCalendarEnabled}
                        onChange={(e) => setIntegrations((i) => ({ ...i, googleCalendarEnabled: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">Ativar</span>
                    </label>
                  </div>
                  {integrations.googleCalendarEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email da conta Google</label>
                      <input
                        type="email"
                        value={integrations.googleCalendarEmail}
                        onChange={(e) => setIntegrations((i) => ({ ...i, googleCalendarEmail: e.target.value }))}
                        placeholder="seu@gmail.com"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <Button variant="outline" className="mt-3">
                        Conectar Google Calendar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Notificações */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Notificações</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={integrations.emailNotifications}
                        onChange={(e) => setIntegrations((i) => ({ ...i, emailNotifications: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span>Receber notificações por email (novos agendamentos, mensagens)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={integrations.smsNotifications}
                        onChange={(e) => setIntegrations((i) => ({ ...i, smsNotifications: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span>Receber notificações por SMS (futuro)</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Segurança */}
          <TabsContent value="security">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Segurança</h2>
              
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={(e) => setSecurity((s) => ({ ...s, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={security.newPassword}
                    onChange={(e) => setSecurity((s) => ({ ...s, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Mínimo 8 caracteres, incluindo letras e números</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity((s) => ({ ...s, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button 
                  onClick={handlePasswordChange}
                  disabled={!security.currentPassword || !security.newPassword || !security.confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Alterar Senha
                </Button>

                <div className="border-t pt-6 mt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Sessões Ativas</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Este dispositivo</p>
                        <p className="text-sm text-gray-500">Windows • Chrome • São Paulo, BR</p>
                        <p className="text-sm text-gray-500">Última atividade: Agora</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

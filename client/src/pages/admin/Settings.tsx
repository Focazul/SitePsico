import { useState, useEffect } from "react";
import { User, Phone, Clock, DollarSign, FileText, Link, Shield, Save, Eye, EyeOff, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [showPassword, setShowPassword] = useState(false);

  // Queries - Use admin endpoint
  const settingsQuery = trpc.settings.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const bulkUpdateMutation = trpc.settings.bulkUpdate.useMutation({
    onSuccess: () => {
      toast.success("Alterações salvas com sucesso!");
      settingsQuery.refetch();
    },
    onError: (error) => toast.error(error.message || "Erro ao salvar"),
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => toast.error(error.message || "Erro ao alterar senha"),
  });

  // ===== FORM STATES =====
  const [profile, setProfile] = useState({ name: "", crp: "", specialty: "", education: "", bio: "", photo: "" });
  const [contact, setContact] = useState({ email: "", phone: "", whatsapp: "", address: "", instagram: "", linkedin: "", website: "" });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(defaultAvailability);
  const [sessionDuration, setSessionDuration] = useState("50");
  const [slotInterval, setSlotInterval] = useState("60");
  const [pricing, setPricing] = useState({ presencial: "", online: "", firstSession: "", package5: "", package10: "" });
  const [content, setContent] = useState({ heroTitle: "", heroSubtitle: "", aboutMe: "", missionStatement: "" });
  const [mapConfig, setMapConfig] = useState({ enabled: false, latitude: "-23.5505", longitude: "-46.6333", title: "", address: "", phoneNumber: "", hours: "", zoom: "15" });
  const [integrations, setIntegrations] = useState({ googleAnalyticsId: "", googleAnalyticsEnabled: false, googleCalendarEnabled: false, googleCalendarEmail: "", emailNotifications: true, smsNotifications: false, whatsappButtonEnabled: true, whatsappDefaultMessage: "" });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Load settings from API
  useEffect(() => {
    if (settingsQuery.data) {
      const map = Object.fromEntries(settingsQuery.data.map(s => [s.key, s.value]));
      setProfile(p => ({ ...p, name: map.psychologist_name || "", crp: map.psychologist_crp || "", specialty: map.psychologist_specialty || "", education: map.psychologist_education || "", bio: map.psychologist_bio || "" }));
      setContact(c => ({ ...c, email: map.email || "", phone: map.phone || "", whatsapp: map.whatsapp_number || "", address: map.address || "", instagram: map.instagram_url || "", linkedin: map.linkedin_url || "", website: map.website || "" }));
      setPricing(p => ({ ...p, presencial: map.consultation_price_presencial || "", online: map.consultation_price_online || "", firstSession: map.consultation_price_first || "", package5: map.consultation_price_package5 || "", package10: map.consultation_price_package10 || "" }));
      setContent(c => ({ ...c, heroTitle: map.hero_title || "", heroSubtitle: map.hero_subtitle || "", aboutMe: map.about_text || "", missionStatement: map.mission_statement || "" }));
      setMapConfig(m => ({ ...m, enabled: map.map_enabled === "true", latitude: map.map_latitude || "-23.5505", longitude: map.map_longitude || "-46.6333", title: map.map_title || "", address: map.map_address || "", phoneNumber: map.map_phone_number || "", hours: map.map_hours || "", zoom: map.map_zoom || "15" }));
      setIntegrations(i => ({ ...i, googleAnalyticsId: map.google_analytics_id || "", googleAnalyticsEnabled: map.google_analytics_enabled === "true", googleCalendarEnabled: map.google_calendar_enabled === "true", googleCalendarEmail: map.google_calendar_email || "", emailNotifications: map.email_notifications !== "false", smsNotifications: map.sms_notifications === "true", whatsappButtonEnabled: map.whatsapp_button_enabled !== "false", whatsappDefaultMessage: map.whatsapp_default_message || "" }));
      
      // Load scheduling settings
      if (map.session_duration) setSessionDuration(map.session_duration);
      if (map.slot_interval) setSlotInterval(map.slot_interval);
      if (map.availability) {
        try {
          const parsed = JSON.parse(map.availability);
          if (Array.isArray(parsed)) setAvailability(parsed);
        } catch (e) {
          console.error("Failed to parse availability:", e);
        }
      }
    }
  }, [settingsQuery.data]);

  // ===== HANDLERS =====
  const handleSaveProfile = () => bulkUpdateMutation.mutate({ updates: [{ key: "psychologist_name", value: profile.name }, { key: "psychologist_crp", value: profile.crp }, { key: "psychologist_specialty", value: profile.specialty }, { key: "psychologist_education", value: profile.education }, { key: "psychologist_bio", value: profile.bio }] });

  const handleSaveContact = () => bulkUpdateMutation.mutate({ updates: [{ key: "email", value: contact.email }, { key: "phone", value: contact.phone }, { key: "whatsapp_number", value: contact.whatsapp }, { key: "address", value: contact.address }, { key: "instagram_url", value: contact.instagram }, { key: "linkedin_url", value: contact.linkedin }, { key: "website", value: contact.website }, { key: "whatsapp_button_enabled", value: integrations.whatsappButtonEnabled ? "true" : "false" }, { key: "whatsapp_default_message", value: integrations.whatsappDefaultMessage }, { key: "google_analytics_enabled", value: integrations.googleAnalyticsEnabled ? "true" : "false" }, { key: "google_analytics_id", value: integrations.googleAnalyticsId }] });

  const handleSaveSchedule = () => bulkUpdateMutation.mutate({ updates: [{ key: "session_duration", value: sessionDuration }, { key: "slot_interval", value: slotInterval }, { key: "availability", value: JSON.stringify(availability) }] });

  const handleSavePricing = () => bulkUpdateMutation.mutate({ updates: [{ key: "consultation_price_presencial", value: pricing.presencial }, { key: "consultation_price_online", value: pricing.online }, { key: "consultation_price_first", value: pricing.firstSession }, { key: "consultation_price_package5", value: pricing.package5 }, { key: "consultation_price_package10", value: pricing.package10 }] });

  const handleSaveContent = () => bulkUpdateMutation.mutate({ updates: [{ key: "hero_title", value: content.heroTitle }, { key: "hero_subtitle", value: content.heroSubtitle }, { key: "about_text", value: content.aboutMe }, { key: "mission_statement", value: content.missionStatement }] });

  const handleSaveMap = () => bulkUpdateMutation.mutate({ updates: [{ key: "map_enabled", value: mapConfig.enabled ? "true" : "false" }, { key: "map_latitude", value: mapConfig.latitude }, { key: "map_longitude", value: mapConfig.longitude }, { key: "map_title", value: mapConfig.title }, { key: "map_address", value: mapConfig.address }, { key: "map_phone_number", value: mapConfig.phoneNumber }, { key: "map_hours", value: mapConfig.hours }, { key: "map_zoom", value: mapConfig.zoom }] });

  const handleSaveIntegrations = () => bulkUpdateMutation.mutate({ updates: [{ key: "google_calendar_enabled", value: integrations.googleCalendarEnabled ? "true" : "false" }, { key: "google_calendar_email", value: integrations.googleCalendarEmail }, { key: "email_notifications", value: integrations.emailNotifications ? "true" : "false" }, { key: "sms_notifications", value: integrations.smsNotifications ? "true" : "false" }] });

  const handlePasswordChange = () => {
    if (security.newPassword !== security.confirmPassword) { toast.error("Senhas não coincidem!"); return; }
    if (security.newPassword.length < 8) { toast.error("Senha mínimo 8 caracteres!"); return; }
    changePasswordMutation.mutate({ currentPassword: security.currentPassword, newPassword: security.newPassword, confirmPassword: security.confirmPassword });
  };

  const handleAvailabilityChange = (index: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    setAvailability(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const SaveButton = ({ onClick, loading }: any) => (
    <Button onClick={onClick} disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
      <Save size={18} /> {loading ? "Salvando..." : "Salvar"}
    </Button>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie seu site e perfil profissional</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-lg flex flex-wrap gap-1">
            <TabsTrigger value="profile" className="gap-2"><User size={16} /><span className="hidden sm:inline">Perfil</span></TabsTrigger>
            <TabsTrigger value="contact" className="gap-2"><Phone size={16} /><span className="hidden sm:inline">Contato</span></TabsTrigger>
            <TabsTrigger value="hours" className="gap-2"><Clock size={16} /><span className="hidden sm:inline">Horários</span></TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2"><DollarSign size={16} /><span className="hidden sm:inline">Valores</span></TabsTrigger>
            <TabsTrigger value="content" className="gap-2"><FileText size={16} /><span className="hidden sm:inline">Conteúdo</span></TabsTrigger>
            <TabsTrigger value="map" className="gap-2"><MapPin size={16} /><span className="hidden sm:inline">Mapa</span></TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2"><Link size={16} /><span className="hidden sm:inline">Integrações</span></TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield size={16} /><span className="hidden sm:inline">Segurança</span></TabsTrigger>
          </TabsList>

          {/* PERFIL */}
          <TabsContent value="profile">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Perfil Profissional</h2>
                <SaveButton onClick={handleSaveProfile} loading={bulkUpdateMutation.isPending} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Nome</label><input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">CRP</label><input type="text" value={profile.crp} onChange={e => setProfile(p => ({ ...p, crp: e.target.value }))} placeholder="06/123456" className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Especialidade</label><input type="text" value={profile.specialty} onChange={e => setProfile(p => ({ ...p, specialty: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Formação</label><textarea value={profile.education} onChange={e => setProfile(p => ({ ...p, education: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Biografia</label><textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={4} className="w-full px-3 py-2 border rounded-lg" /><p className="text-xs text-gray-500 mt-1">{profile.bio.length}/500</p></div>
            </Card>
          </TabsContent>

          {/* CONTATO */}
          <TabsContent value="contact">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Contato</h2>
                <SaveButton onClick={handleSaveContact} loading={bulkUpdateMutation.isPending} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                  <p className="text-xs text-blue-600 mt-1">
                    ℹ️ Este email será usado como remetente dos emails automáticos (confirmações, notificações, etc)
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ O email precisa estar verificado no Resend ou usar um domínio próprio configurado
                  </p>
                </div>
                <div><label className="block text-sm font-medium mb-1">Telefone</label><input type="tel" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">WhatsApp</label><input type="tel" value={contact.whatsapp} onChange={e => setContact(c => ({ ...c, whatsapp: e.target.value }))} placeholder="5511999999999" className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Instagram</label><input type="text" value={contact.instagram} onChange={e => setContact(c => ({ ...c, instagram: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Endereço</label><textarea value={contact.address} onChange={e => setContact(c => ({ ...c, address: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">WhatsApp Flutuante</h3>
                <label className="flex items-center gap-2"><input type="checkbox" checked={integrations.whatsappButtonEnabled} onChange={e => setIntegrations(i => ({ ...i, whatsappButtonEnabled: e.target.checked }))} className="w-4 h-4" /><span>Habilitar botão</span></label>
                <textarea value={integrations.whatsappDefaultMessage} onChange={e => setIntegrations(i => ({ ...i, whatsappDefaultMessage: e.target.value }))} placeholder="Mensagem padrão" rows={2} className="w-full px-3 py-2 border rounded-lg mt-2" />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Google Analytics</h3>
                <label className="flex items-center gap-2"><input type="checkbox" checked={integrations.googleAnalyticsEnabled} onChange={e => setIntegrations(i => ({ ...i, googleAnalyticsEnabled: e.target.checked }))} className="w-4 h-4" /><span>Habilitar</span></label>
                <input type="text" value={integrations.googleAnalyticsId} onChange={e => setIntegrations(i => ({ ...i, googleAnalyticsId: e.target.value }))} placeholder="G-XXXXXXXXXX" disabled={!integrations.googleAnalyticsEnabled} className="w-full px-3 py-2 border rounded-lg mt-2" />
              </div>
            </Card>
          </TabsContent>

          {/* HORÁRIOS */}
          <TabsContent value="hours">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Horários</h2>
                <SaveButton onClick={handleSaveSchedule} loading={bulkUpdateMutation.isPending} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Duração da Sessão</label><select value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} className="w-full px-3 py-2 border rounded-lg"><option value="45">45 min</option><option value="50">50 min</option><option value="60">60 min</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Intervalo entre Sessões</label><select value={slotInterval} onChange={e => setSlotInterval(e.target.value)} className="w-full px-3 py-2 border rounded-lg"><option value="50">50 min</option><option value="60">60 min</option><option value="90">90 min</option></select></div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Disponibilidade Semanal</h3>
                <div className="space-y-2">
                  {availability.map((slot, idx) => (
                    <div key={slot.day} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <input type="checkbox" checked={slot.enabled} onChange={e => handleAvailabilityChange(idx, "enabled", e.target.checked)} className="w-4 h-4" />
                      <span className="w-32 text-sm">{slot.dayLabel}</span>
                      {slot.enabled && (
                        <>
                          <input type="time" value={slot.start} onChange={e => handleAvailabilityChange(idx, "start", e.target.value)} className="px-2 py-1 border rounded text-sm" />
                          <span>até</span>
                          <input type="time" value={slot.end} onChange={e => handleAvailabilityChange(idx, "end", e.target.value)} className="px-2 py-1 border rounded text-sm" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* VALORES */}
          <TabsContent value="pricing">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Valores de Consulta</h2>
                <SaveButton onClick={handleSavePricing} loading={bulkUpdateMutation.isPending} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Presencial</label><input type="number" value={pricing.presencial} onChange={e => setPricing(p => ({ ...p, presencial: e.target.value }))} placeholder="250" className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Online</label><input type="number" value={pricing.online} onChange={e => setPricing(p => ({ ...p, online: e.target.value }))} placeholder="200" className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Primeira Sessão</label><input type="number" value={pricing.firstSession} onChange={e => setPricing(p => ({ ...p, firstSession: e.target.value }))} placeholder="200" className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Pacote 5 Sessões</label><input type="number" value={pricing.package5} onChange={e => setPricing(p => ({ ...p, package5: e.target.value }))} placeholder="1100" className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Pacote 10 Sessões</label><input type="number" value={pricing.package10} onChange={e => setPricing(p => ({ ...p, package10: e.target.value }))} placeholder="2000" className="w-full px-3 py-2 border rounded-lg" /></div>
            </Card>
          </TabsContent>

          {/* CONTEÚDO */}
          <TabsContent value="content">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Conteúdo do Site</h2>
                <SaveButton onClick={handleSaveContent} loading={bulkUpdateMutation.isPending} />
              </div>
              <div><label className="block text-sm font-medium mb-1">Título Principal (Hero)</label><input type="text" value={content.heroTitle} onChange={e => setContent(c => ({ ...c, heroTitle: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Subtítulo (Hero)</label><textarea value={content.heroSubtitle} onChange={e => setContent(c => ({ ...c, heroSubtitle: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Sobre Mim</label><textarea value={content.aboutMe} onChange={e => setContent(c => ({ ...c, aboutMe: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Missão</label><textarea value={content.missionStatement} onChange={e => setContent(c => ({ ...c, missionStatement: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
            </Card>
          </TabsContent>

          {/* MAPA */}
          <TabsContent value="map">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Configuração do Mapa</h2>
                <SaveButton onClick={handleSaveMap} loading={bulkUpdateMutation.isPending} />
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={mapConfig.enabled} onChange={e => setMapConfig(m => ({ ...m, enabled: e.target.checked }))} className="w-4 h-4" /><span>Habilitar mapa</span></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Latitude</label><input type="text" value={mapConfig.latitude} onChange={e => setMapConfig(m => ({ ...m, latitude: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Longitude</label><input type="text" value={mapConfig.longitude} onChange={e => setMapConfig(m => ({ ...m, longitude: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Título</label><input type="text" value={mapConfig.title} onChange={e => setMapConfig(m => ({ ...m, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Endereço</label><input type="text" value={mapConfig.address} onChange={e => setMapConfig(m => ({ ...m, address: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Telefone</label><input type="tel" value={mapConfig.phoneNumber} onChange={e => setMapConfig(m => ({ ...m, phoneNumber: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Zoom</label><input type="number" value={mapConfig.zoom} onChange={e => setMapConfig(m => ({ ...m, zoom: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Horários</label><input type="text" value={mapConfig.hours} onChange={e => setMapConfig(m => ({ ...m, hours: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
            </Card>
          </TabsContent>

          {/* INTEGRAÇÕES */}
          <TabsContent value="integrations">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Integrações</h2>
                <SaveButton onClick={handleSaveIntegrations} loading={bulkUpdateMutation.isPending} />
              </div>
              <div><h3 className="font-semibold mb-3">Google Calendar</h3><label className="flex items-center gap-2"><input type="checkbox" checked={integrations.googleCalendarEnabled} onChange={e => setIntegrations(i => ({ ...i, googleCalendarEnabled: e.target.checked }))} className="w-4 h-4" /><span>Habilitar</span></label><input type="email" value={integrations.googleCalendarEmail} onChange={e => setIntegrations(i => ({ ...i, googleCalendarEmail: e.target.value }))} placeholder="seu-email@gmail.com" disabled={!integrations.googleCalendarEnabled} className="w-full px-3 py-2 border rounded-lg mt-2" /></div>
              <div className="border-t pt-4"><h3 className="font-semibold mb-3">Notificações</h3><label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={integrations.emailNotifications} onChange={e => setIntegrations(i => ({ ...i, emailNotifications: e.target.checked }))} className="w-4 h-4" /><span>Email</span></label><label className="flex items-center gap-2"><input type="checkbox" checked={integrations.smsNotifications} onChange={e => setIntegrations(i => ({ ...i, smsNotifications: e.target.checked }))} className="w-4 h-4" /><span>SMS</span></label></div>
            </Card>
          </TabsContent>

          {/* SEGURANÇA */}
          <TabsContent value="security">
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">Alterar Senha</h2>
              <div><label className="block text-sm font-medium mb-1">Senha Atual</label><div className="relative"><input type={showPassword ? "text" : "password"} value={security.currentPassword} onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))} className="w-full px-3 py-2 border rounded-lg pr-10" /><button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
              <div><label className="block text-sm font-medium mb-1">Nova Senha</label><input type="password" value={security.newPassword} onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Confirmar Senha</label><input type="password" value={security.confirmPassword} onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              <Button onClick={handlePasswordChange} disabled={changePasswordMutation.isPending} className="bg-red-600 hover:bg-red-700">
                {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

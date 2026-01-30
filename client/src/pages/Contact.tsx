import { FormEvent, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import Map from '@/components/Map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useMapConfig } from '@/hooks/useMapConfig';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { BookOpen, CheckCircle2, Clock, Info, Mail, MapPin, Phone, Send, Shield, User } from 'lucide-react';
import { trackFormSubmission } from '@/lib/analytics';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  captcha: boolean;
};

export default function Contact() {
  const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const infoRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const formRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const mapRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  const { config: mapConfig } = useMapConfig();
  const { config: siteConfig } = useSiteConfig();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    captcha: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const isDisabled = useMemo(() => {
    return status === 'submitting' || !form.captcha;
  }, [status, form.captcha]);

  const validate = () => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Informe seu nome completo.';
    if (!form.email.trim()) newErrors.email = 'Informe um e-mail válido.';
    if (form.email && !/.+@.+\..+/.test(form.email)) newErrors.email = 'Formato de e-mail inválido.';
    if (!form.subject.trim()) newErrors.subject = 'Defina um assunto.';
    if (!form.message.trim()) newErrors.message = 'Escreva sua mensagem.';
    if (!form.captcha) newErrors.captcha = 'Confirme que você não é um robô (placeholder).';
    return newErrors;
  };

    const sendMessageMutation = trpc.contact.sendMessage.useMutation({
      onSuccess: () => {
        toast.success('Mensagem enviada com sucesso! Retornaremos em breve.');
        setStatus('success');
        setForm({ name: '', email: '', phone: '', subject: '', message: '', captcha: false });
      },
      onError: (error) => {
        toast.error(error.message || 'Erro ao enviar mensagem. Tente novamente.');
        setStatus('idle');
      },
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setStatus('submitting');

    // Track form submission
    trackFormSubmission('contact_form', 'contact');

      // Enviar para o backend
      await sendMessageMutation.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim(),
        content: form.message.trim(),
      });
  };

  const handleChange = (field: keyof FormState) => (value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        {/* HERO */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/10">
          <div className="container">
            <div
              ref={heroRef.ref}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center transition-all duration-700 ${
                heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="space-y-4">
                <Badge className="bg-accent/15 text-accent border-accent/30 rounded-full px-4 py-1">Contato</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Vamos conversar sobre sua necessidade
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Tire dúvidas sobre modalidades, horários, valores e como a terapia pode ajudar no seu momento atual.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-border/60">Sigilo e ética profissional</Badge>
                  <Badge variant="outline" className="border-border/60">Respostas em até 24h</Badge>
                  <Badge variant="outline" className="border-border/60">Atendimento presencial e online</Badge>
                </div>
              </div>

              <Card className="p-6 md:p-8 border-accent/30 shadow-lg space-y-3 bg-background/80 backdrop-blur interactive-card">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <p className="font-semibold text-foreground">Sigilo e acolhimento</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Informações enviadas são tratadas com confidencialidade, conforme Código de Ética Profissional do Psicólogo.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">Retorno em até 24h</div>
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">Canal seguro e direto</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* INFO CARDS */}
        <section className="py-12 md:py-16" ref={infoRef.ref}>
          <div className="container">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${
              infoRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <Card className="p-4 border-border/60 space-y-2 interactive-card">
                <div className="flex items-center gap-2 text-accent">
                  <MapPin className="w-4 h-4" />
                  <p className="font-semibold text-foreground">Endereço</p>
                </div>
                <p className="text-sm text-muted-foreground">{siteConfig.address || 'São Paulo - SP'}</p>
                <p className="text-xs text-muted-foreground">Endereço completo informado no agendamento.</p>
              </Card>

              <Card className="p-4 border-border/60 space-y-2 interactive-card">
                <div className="flex items-center gap-2 text-accent">
                  <Mail className="w-4 h-4" />
                  <p className="font-semibold text-foreground">Email</p>
                </div>
                <p className="text-sm text-muted-foreground">{siteConfig.email || 'contato@seudominio.com'}</p>
                <p className="text-xs text-muted-foreground">Retorno em até 24 horas úteis.</p>
              </Card>

              <Card className="p-4 border-border/60 space-y-2 interactive-card">
                <div className="flex items-center gap-2 text-accent">
                  <Phone className="w-4 h-4" />
                  <p className="font-semibold text-foreground">Telefone / WhatsApp</p>
                </div>
                <p className="text-sm text-muted-foreground">{siteConfig.phone || '(11) 99999-9999'}</p>
                <p className="text-xs text-muted-foreground">Preferencialmente WhatsApp para agilizar.</p>
              </Card>

              <Card className="p-4 border-border/60 space-y-2 interactive-card">
                <div className="flex items-center gap-2 text-accent">
                  <Clock className="w-4 h-4" />
                  <p className="font-semibold text-foreground">Horários</p>
                </div>
                <p className="text-sm text-muted-foreground">{siteConfig.openingHours || 'Seg a Sex — 8h às 19h'}</p>
                <p className="text-xs text-muted-foreground">Consulte disponibilidade no agendamento.</p>
              </Card>
            </div>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* FORM */}
        <section className="py-16 md:py-24 bg-secondary/10" ref={formRef.ref}>
          <div className="container grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 items-start">
            <Card
              className={`p-6 md:p-8 shadow-lg border-accent/30 bg-background transition-all duration-700 interactive-card ${
                formRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Envie sua mensagem</h2>
                <p className="text-muted-foreground">Preencha os campos para receber retorno em até 24h úteis.</p>
              </div>

              {status === 'success' ? (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/40 flex items-start gap-3" role="status" aria-live="polite">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Mensagem enviada (placeholder)</p>
                    <p className="text-sm text-muted-foreground">Integração real será feita na fase de backend.</p>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit} aria-busy={status === 'submitting'}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <User className="w-4 h-4 text-accent" /> Nome completo
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleChange('name')(e.target.value)}
                        placeholder="Seu nome"
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && <p className="text-xs text-destructive" role="alert" aria-live="assertive">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4 text-accent" /> Email
                      </label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email')(e.target.value)}
                        placeholder="seu@email.com"
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email && <p className="text-xs text-destructive" role="alert" aria-live="assertive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4 text-accent" /> Telefone (opcional)
                      </label>
                      <Input
                        value={form.phone}
                        onChange={(e) => handleChange('phone')(e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-accent" /> Assunto
                      </label>
                      <Input
                        value={form.subject}
                        onChange={(e) => handleChange('subject')(e.target.value)}
                        placeholder="Ex: Agendamento, valores, dúvida"
                        aria-invalid={Boolean(errors.subject)}
                      />
                      {errors.subject && <p className="text-xs text-destructive" role="alert" aria-live="assertive">{errors.subject}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Mensagem</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => handleChange('message')(e.target.value)}
                      placeholder="Conte um pouco sobre o que precisa..."
                      rows={5}
                      aria-invalid={Boolean(errors.message)}
                    />
                    {errors.message && <p className="text-xs text-destructive" role="alert" aria-live="assertive">{errors.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border/60 bg-muted/40">
                      <input
                        id="captcha"
                        type="checkbox"
                        className="w-4 h-4"
                        checked={form.captcha}
                        onChange={(e) => handleChange('captcha')(e.target.checked)}
                      />
                      <label htmlFor="captcha" className="text-sm text-foreground">
                        Não sou um robô (placeholder reCAPTCHA)
                      </label>
                    </div>
                    {errors.captcha && <p className="text-xs text-destructive" role="alert" aria-live="assertive">{errors.captcha}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="submit"
                      disabled={isDisabled}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      isLoading={status === 'submitting'}
                      loadingText="Enviando..."
                    >
                      <Send className="w-4 h-4 mr-2" /> Enviar mensagem
                    </Button>
                    <Button type="button" variant="outline" onClick={() => (window.location.href = '/#agendamento')}>
                      Agendar consulta
                    </Button>
                    <p className="text-xs text-muted-foreground">Tempo de resposta: até 24h úteis.</p>
                  </div>
                </form>
              )}
            </Card>

            <div
              className={`space-y-4 transition-all duration-700 ${
                formRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Card className="p-5 border-border/60 space-y-3 interactive-card">
                <p className="font-semibold text-foreground">Dicas rápidas</p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Se puder, indique dias/horários preferidos.</li>
                  <li>Diga se prefere presencial ou online.</li>
                  <li>Para primeira sessão, compartilhe brevemente sua demanda.</li>
                </ul>
              </Card>

              <Card className="p-5 border-border/60 space-y-3 interactive-card">
                <p className="font-semibold text-foreground">Redes e contato rápido</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => (window.location.href = 'https://www.instagram.com')}>
                    Instagram
                  </Button>
                  <Button variant="outline" onClick={() => (window.location.href = 'https://www.linkedin.com')}>
                    LinkedIn
                  </Button>
                  <Button variant="outline" onClick={() => (window.location.href = 'https://wa.me/5511999999999')}>
                    WhatsApp
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Links placeholder — atualizar com dados reais.</p>
              </Card>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* MAPA */}
        <section className="py-16 md:py-24" ref={mapRef.ref}>
          <div
            className={`container space-y-6 transition-all duration-700 ${
              mapRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-6 h-6 text-accent" />
                Localização do consultório
              </h2>
              <p className="text-muted-foreground">Visite-nos pessoalmente ou solicite instruções pelo WhatsApp.</p>
            </div>
            
            {mapConfig?.enabled ? (
              <div className="rounded-2xl overflow-hidden border border-border/60 shadow-lg">
                <Map
                  latitude={mapConfig.latitude}
                  longitude={mapConfig.longitude}
                  title={mapConfig.title}
                  address={mapConfig.address}
                  phoneNumber={mapConfig.phoneNumber}
                  hours={mapConfig.hours}
                  zoom={mapConfig.zoom}
                  height="500px"
                />
              </div>
            ) : (
              <Card className="p-8 text-center space-y-4 bg-accent/5 border-accent/30">
                <MapPin className="w-12 h-12 text-accent mx-auto opacity-50" />
                <div>
                  <p className="font-semibold text-foreground">Localização</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Endereço completo será compartilhado após confirmação do agendamento.
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.href = 'https://wa.me/5511999999999'}>
                  Solicitar endereço via WhatsApp
                </Button>
              </Card>
            )}

            <Card className="p-6 border-border/60 bg-secondary/10 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Informações importantes</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Estacionamento disponível no prédio</li>
                    <li>Acessibilidade para pessoas com mobilidade reduzida</li>
                    <li>Atendimento presencial e online (videochamada)</li>
                    <li>Agendamento por telefone ou WhatsApp</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />
      </main>

      <Footer />
    </div>
  );
}
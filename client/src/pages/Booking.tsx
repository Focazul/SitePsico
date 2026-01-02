import { FormEvent, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Clock, Home, Laptop, Mail, Phone, Shield, User } from 'lucide-react';
import { trackFormSubmission, trackAppointmentCompleted } from '@/lib/analytics';

type BookingState = {
  modality: 'Presencial' | 'Online' | '';
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const steps = [
  { id: 1, title: 'Modalidade' },
  { id: 2, title: 'Data e horário' },
  { id: 3, title: 'Dados do paciente' },
  { id: 4, title: 'Confirmação' },
];

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function Booking() {
  const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const wizardRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errors, setErrors] = useState<Partial<BookingState>>({});
  const [data, setData] = useState<BookingState>({
    modality: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const progress = useMemo(() => (step / steps.length) * 100, [step]);

  const setField = (field: keyof BookingState, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (current: number) => {
    const newErrors: Partial<BookingState> = {};
    if (current === 1 && !data.modality) newErrors.modality = 'Escolha uma modalidade.';
    if (current === 2) {
      if (!data.date) newErrors.date = 'Escolha uma data.';
      if (!data.time) newErrors.time = 'Selecione um horário.';
    }
    if (current === 3) {
      if (!data.name.trim()) newErrors.name = 'Informe seu nome.';
      if (!data.email.trim()) newErrors.email = 'Informe um email.';
      if (data.email && !/.+@.+\..+/.test(data.email)) newErrors.email = 'Email inválido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const back = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setStatus('submitting');
    
    // Track form submission
    trackFormSubmission('booking', true);
    
    setTimeout(() => {
      setStatus('success');
      // Track appointment completion (conversion event)
      trackAppointmentCompleted(data.modality, data.date);
    }, 700);
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
                <Badge className="bg-accent/15 text-accent border-accent/30 rounded-full px-4 py-1">Agendamento</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Reserve sua sessão com segurança
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Escolha modalidade, horário e compartilhe seus dados básicos. Confirmação em até 24h úteis (placeholder).
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-border/60">Presencial ou online</Badge>
                  <Badge variant="outline" className="border-border/60">Sigilo e ética</Badge>
                  <Badge variant="outline" className="border-border/60">Confirmação rápida</Badge>
                </div>
              </div>

              <Card className="p-6 md:p-8 border-accent/30 shadow-lg space-y-3 bg-background/80 backdrop-blur">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <p className="font-semibold text-foreground">Confirmação manual</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este fluxo é um protótipo. Na fase de backend, horários serão verificados para evitar double-booking e você receberá email de confirmação automático.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">Duração 50 min</div>
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">Retorno em até 24h</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* WIZARD */}
        <section className="py-16 md:py-24" ref={wizardRef.ref}>
          <div
            className={`container max-w-5xl space-y-8 transition-all duration-700 ${
              wizardRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-accent" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Passo {step} de {steps.length}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Complete o agendamento</h2>
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className={`p-5 border ${data.modality === 'Presencial' ? 'border-accent ring-2 ring-accent/30' : 'border-border/60'} cursor-pointer transition-all`}
                    onClick={() => setField('modality', 'Presencial')}
                    role="button"
                    aria-pressed={data.modality === 'Presencial'}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground">Presencial</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Consultório acolhedor em São Paulo (endereço completo enviado na confirmação).
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">Sigilo garantido e ambiente reservado.</p>
                  </Card>

                  <Card
                    className={`p-5 border ${data.modality === 'Online' ? 'border-accent ring-2 ring-accent/30' : 'border-border/60'} cursor-pointer transition-all`}
                    onClick={() => setField('modality', 'Online')}
                    role="button"
                    aria-pressed={data.modality === 'Online'}
                  >
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground">Online</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Sessões via plataforma segura e confidencial, conforme Resolução CFP nº 11/2018.
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">Use fones e conexão estável para melhor experiência.</p>
                  </Card>
                </div>
              )}

              {step === 2 && (
                <Card className="p-5 border-border/60 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-accent" /> Data preferencial
                      </label>
                      <Input type="date" value={data.date} onChange={(e) => setField('date', e.target.value)} />
                      {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4 text-accent" /> Horário preferencial
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={data.time === slot ? 'default' : 'outline'}
                            className={data.time === slot ? 'bg-accent text-accent-foreground' : ''}
                            onClick={() => setField('time', slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                      {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Horários reais e bloqueios serão tratados na integração com backend.</p>
                </Card>
              )}

              {step === 3 && (
                <Card className="p-5 border-border/60 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <User className="w-4 h-4 text-accent" /> Nome completo
                      </label>
                      <Input value={data.name} onChange={(e) => setField('name', e.target.value)} placeholder="Seu nome" />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4 text-accent" /> Email
                      </label>
                      <Input value={data.email} onChange={(e) => setField('email', e.target.value)} placeholder="seu@email.com" />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4 text-accent" /> Telefone (opcional)
                      </label>
                      <Input value={data.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">Observações (opcional)</label>
                      <Textarea value={data.notes} onChange={(e) => setField('notes', e.target.value)} rows={3} placeholder="Ex: preferência de atendimento, necessidades específicas" />
                    </div>
                  </div>
                </Card>
              )}

              {step === 4 && (
                <Card className="p-5 border-border/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <p className="font-semibold text-foreground">Revise antes de enviar</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                      <p className="font-semibold text-foreground">Modalidade</p>
                      <p>{data.modality || '—'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                      <p className="font-semibold text-foreground">Data e horário</p>
                      <p>{data.date || '—'} {data.time && `às ${data.time}`}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                      <p className="font-semibold text-foreground">Contato</p>
                      <p>{data.name || '—'}</p>
                      <p>{data.email || '—'}</p>
                      <p>{data.phone || '—'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                      <p className="font-semibold text-foreground">Observações</p>
                      <p>{data.notes || 'Nenhuma observação adicional.'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Ao enviar, você concorda com o contato para confirmação do horário (placeholder de consentimento LGPD).</p>
                </Card>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {step > 1 && step <= steps.length && (
                  <Button type="button" variant="outline" onClick={back}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                )}

                {step < steps.length && (
                  <Button type="button" onClick={next} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Próximo passo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {step === steps.length && (
                  <Button type="submit" disabled={status === 'submitting'} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {status === 'submitting' ? 'Enviando...' : 'Confirmar agendamento'}
                  </Button>
                )}
              </div>

              {status === 'success' && (
                <Card className="p-4 border-accent/40 bg-accent/10 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Solicitação registrada (placeholder)</p>
                    <p className="text-sm text-muted-foreground">Na próxima fase, enviaremos confirmação automática por email e bloquearemos o horário escolhido.</p>
                  </div>
                </Card>
              )}
            </form>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />
      </main>

      <Footer />
    </div>
  );
}
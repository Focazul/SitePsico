import { FormEvent, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Clock, Home, Laptop, Mail, Phone, Shield, User } from 'lucide-react';
import { trackFormSubmission, trackAppointmentCompleted } from '@/lib/analytics';
import { trpc } from '@/lib/trpc';

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

export default function Booking() {
  const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const wizardRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const { config } = useSiteConfig();
  const sessionDuration = config.sessionDuration || '50';
  const enabledWeekdays = useMemo(() => {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const enabled = new Set<number>();
    if (config.availability?.length) {
      config.availability.forEach((slot) => {
        if (slot.enabled !== false && slot.day && dayMap[slot.day] !== undefined) {
          enabled.add(dayMap[slot.day]);
        }
      });
    }
    // If nothing configured, allow all days
    if (enabled.size === 0) {
      [0, 1, 2, 3, 4, 5, 6].forEach((d) => enabled.add(d));
    }
    return enabled;
  }, [config.availability]);

  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof BookingState, string>>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [data, setData] = useState<BookingState>({
    modality: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const slotsQuery = trpc.booking.getAvailableSlots.useQuery(
    { date: data.date },
    { enabled: !!data.date, staleTime: 5 * 60 * 1000 }
  );

  useEffect(() => {
    // Reset selected time when the date changes to avoid stale selections
    setData((prev) => {
      if (prev.time === '') return prev;
      return { ...prev, time: '' };
    });
    setErrors((prev) => (prev.time ? { ...prev, time: undefined } : prev));
  }, [data.date]);

  useEffect(() => {
    if (!selectedDate) return;
    const iso = format(selectedDate, 'yyyy-MM-dd');
    setData((prev) => (prev.date === iso ? prev : { ...prev, date: iso }));
  }, [selectedDate]);

  const progress = useMemo(() => (step / steps.length) * 100, [step]);

  const availableSlots = slotsQuery.data?.slots ?? [];
  const isLoadingSlots = slotsQuery.isFetching;
  const noSlots = !!data.date && !isLoadingSlots && availableSlots.length === 0;

  const setField = (field: keyof BookingState, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (current: number) => {
    const newErrors: Partial<Record<keyof BookingState, string>> = {};
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
    trackFormSubmission('booking_form', 'booking');
    
    setTimeout(() => {
      setStatus('success');
      // Track appointment completion (conversion event)
      trackAppointmentCompleted(data.modality === 'Presencial' ? 'presencial' : 'online');
    }, 700);
  };

  // Already loaded above; keep single source of sessionDuration

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
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">Duração {sessionDuration} min</div>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between"
                          >
                            {data.date ? format(new Date(`${data.date}T00:00:00`), 'dd/MM/yyyy') : 'Selecione uma data'}
                            <Calendar className="w-4 h-4 opacity-70" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <CalendarPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(day) => setSelectedDate(day ?? undefined)}
                            disabled={(day) => !enabledWeekdays.has(day.getDay())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4 text-accent" /> Horário preferencial
                      </label>
                      <div className="flex flex-wrap gap-2 min-h-[48px]">
                        {!data.date && <p className="text-sm text-muted-foreground">Escolha uma data para ver horários.</p>}
                        {data.date && isLoadingSlots && <p className="text-sm text-muted-foreground">Carregando horários disponíveis…</p>}
                        {data.date && !isLoadingSlots && availableSlots.map(({ time }) => (
                          <Button
                            key={time}
                            type="button"
                            variant={data.time === time ? 'default' : 'outline'}
                            className={data.time === time ? 'bg-accent text-accent-foreground' : ''}
                            onClick={() => setField('time', time)}
                          >
                            {time}
                          </Button>
                        ))}
                        {noSlots && <p className="text-sm text-muted-foreground">Nenhum horário disponível para esta data.</p>}
                        {slotsQuery.error && (
                          <p className="text-sm text-destructive">Não foi possível carregar horários. Tente novamente.</p>
                        )}
                      </div>
                      {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Horários refletem a disponibilidade configurada no painel e bloqueios aplicados.</p>
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
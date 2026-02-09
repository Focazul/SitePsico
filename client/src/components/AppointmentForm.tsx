import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Calendar, Clock, Phone, Mail, User, MessageSquare } from 'lucide-react';

const appointmentSchema = z.object({
  clientName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  clientEmail: z.string().email('Email inválido'),
  clientPhone: z.string().min(10, 'Telefone inválido'),
  appointmentDate: z.string().min(1, 'Selecione uma data'),
  appointmentTime: z.string().min(1, 'Selecione um horário'),
  modality: z.enum(['presencial', 'online']),
  subject: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function AppointmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createAppointment = trpc.booking.create.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      modality: 'online',
    },
  });

  const selectedDate = watch('appointmentDate');
  const selectedModality = watch('modality');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const [year, month, day] = (data.appointmentDate as string).split('-');
      const appointmentDate = `${year}-${month}-${day}`;

      await createAppointment.mutateAsync({
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        appointmentDate,
        appointmentTime: data.appointmentTime,
        modality: data.modality,
        subject: data.subject,
        notes: data.notes,
      });

      toast.success('Consulta agendada com sucesso! Você receberá uma confirmação por email.');
      reset();
    } catch (error) {
      toast.error('Erro ao agendar consulta. Tente novamente.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate available time slots
  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = 9 + i;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 md:p-8 border-border/50">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Agendar Consulta</h2>
        <p className="text-muted-foreground">
          Preencha o formulário abaixo para solicitar seu agendamento
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Pessoais */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            Informações Pessoais
          </h3>

          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-foreground">
              Nome Completo *
            </Label>
            <Input
              id="clientName"
              placeholder="Seu nome"
              {...register('clientName')}
              className="border-border/50 focus:border-accent"
            />
            {errors.clientName && (
              <p className="text-sm text-destructive">{errors.clientName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientEmail" className="text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                Email *
              </Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="seu@email.com"
                {...register('clientEmail')}
                className="border-border/50 focus:border-accent"
              />
              {errors.clientEmail && (
                <p className="text-sm text-destructive">{errors.clientEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone" className="text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                Telefone/WhatsApp *
              </Label>
              <Input
                id="clientPhone"
                placeholder="(11) 99999-9999"
                {...register('clientPhone')}
                className="border-border/50 focus:border-accent"
              />
              {errors.clientPhone && (
                <p className="text-sm text-destructive">{errors.clientPhone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Detalhes do Agendamento */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            Detalhes do Agendamento
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate" className="text-foreground">
                Data da Consulta *
              </Label>
              <Input
                id="appointmentDate"
                type="date"
                min={today}
                max={maxDateStr}
                {...register('appointmentDate')}
                className="border-border/50 focus:border-accent"
              />
              {errors.appointmentDate && (
                <p className="text-sm text-destructive">{errors.appointmentDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentTime" className="text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Horário *
              </Label>
              <Select onValueChange={(value) => setValue('appointmentTime', value)}>
                <SelectTrigger className="border-border/50 focus:border-accent">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.appointmentTime && (
                <p className="text-sm text-destructive">{errors.appointmentTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modality" className="text-foreground">
              Modalidade de Atendimento *
            </Label>
            <Select onValueChange={(value) => setValue('modality', value as any)}>
              <SelectTrigger className="border-border/50 focus:border-accent">
                <SelectValue placeholder="Selecione a modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
            {errors.modality && (
              <p className="text-sm text-destructive">{errors.modality.message}</p>
            )}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            Informações Adicionais
          </h3>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-foreground">
              Assunto da Consulta
            </Label>
            <Input
              id="subject"
              placeholder="Ex: Ansiedade, Estresse, Relacionamentos..."
              {...register('subject')}
              className="border-border/50 focus:border-accent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Observações Adicionais
            </Label>
            <Textarea
              id="notes"
              placeholder="Compartilhe qualquer informação adicional que considere importante..."
              className="border-border/50 focus:border-accent min-h-24 resize-none"
              {...register('notes')}
            />
          </div>
        </div>

        {/* Aviso de Privacidade */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Privacidade:</strong> Seus dados serão tratados com sigilo profissional 
            conforme as normas do CRP-SP e Código de Ética da Psicologia.
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || createAppointment.isPending}
            className="btn-lapis-lazuli flex-1 transition-all duration-200"
            size="lg"
          >
            {isSubmitting || createAppointment.isPending ? 'Agendando...' : 'Agendar Consulta'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            className="flex-1"
            size="lg"
          >
            Limpar
          </Button>
        </div>
      </form>
    </Card>
  );
}

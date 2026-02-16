import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Modality = "presencial" | "online";

interface QuickBookingData {
  name: string;
  email: string;
  phone: string;
  modality: Modality;
  date: string;
  time: string;
  note: string;
}

interface ManusDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const defaultData: QuickBookingData = {
  name: "",
  email: "",
  phone: "",
  modality: "presencial",
  date: "",
  time: "",
  note: "",
};

// Modal de agendamento rápido (frontend placeholder)
export function ManusDialog({ open = false, onOpenChange, onSuccess }: ManusDialogProps) {
  const [internalOpen, setInternalOpen] = useState(open);
  const [data, setData] = useState<QuickBookingData>(defaultData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { config } = useSiteConfig();
  const sendMessageMutation = trpc.contact.sendMessage.useMutation({
    onSuccess: () => {
      toast.success("Pedido de agendamento enviado com sucesso!");
      setSubmitted(true);
      setLoading(false);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar pedido. Tente novamente.");
      setLoading(false);
    },
  });

  const slotsQuery = trpc.booking.getAvailableSlots.useQuery(
    { date: data.date },
    { enabled: !!data.date, staleTime: 5 * 60 * 1000 }
  );

  const isRequiredMissing = useMemo(() => {
    return !data.name || !data.email || !data.date || !data.time;
  }, [data.date, data.email, data.name, data.time]);

  useEffect(() => {
    if (onOpenChange) return;
    setInternalOpen(open);
  }, [open, onOpenChange]);

  const handleOpenChange = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
    if (!next) {
      setError(null);
      setSubmitted(false);
      setData(defaultData);
    }
  };

  useEffect(() => {
    setData((prev) => (prev.time ? { ...prev, time: "" } : prev));
  }, [data.date]);

  useEffect(() => {
    if (!selectedDate) return;
    const iso = format(selectedDate, "yyyy-MM-dd");
    setData((prev) => (prev.date === iso ? prev : { ...prev, date: iso }));
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isRequiredMissing) {
      setError("Preencha nome, email, data e horário.");
      return;
    }
    setLoading(true);

    const subject = `Agendamento rápido - ${format(new Date(`${data.date}T00:00:00`), "dd/MM/yyyy")} ${data.time}`;
    const contentLines = [
      `Pedido de agendamento rápido`,
      `Nome: ${data.name}`,
      `Email: ${data.email}`,
      data.phone ? `Telefone: ${data.phone}` : null,
      `Data: ${format(new Date(`${data.date}T00:00:00`), "dd/MM/yyyy")}`,
      `Horário: ${data.time}`,
      `Modalidade: ${data.modality}`,
      data.note ? `Observações: ${data.note}` : null,
    ].filter(Boolean).join("\n");

    try {
      await sendMessageMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim() || undefined,
        subject,
        content: contentLines,
      });
    } catch {
      setError("Não foi possível enviar. Tente novamente.");
      setLoading(false);
    }
  };

  const slotOptions = slotsQuery.data?.slots ?? [];
  const isLoadingSlots = slotsQuery.isFetching;
  const noSlots = !!data.date && !isLoadingSlots && slotOptions.length === 0;

  const availabilityEnabledDays = useMemo(() => {
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
    if (enabled.size === 0) [0, 1, 2, 3, 4, 5, 6].forEach((d) => enabled.add(d));
    return enabled;
  }, [config.availability]);
  const availabilityDisabledDays = useMemo(() => {
    const all = new Set([0, 1, 2, 3, 4, 5, 6]);
    availabilityEnabledDays.forEach((d) => all.delete(d));
    return all;
  }, [availabilityEnabledDays]);

  const dialogOpen = onOpenChange ? open : internalOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 text-left">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">Agendamento rápido</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Informe dados essenciais e escolha um horário. Confirmação real será feita na fase de backend.
          </DialogDescription>
        </DialogHeader>

        <form id="quick-booking-form" onSubmit={handleSubmit} className="px-4 sm:px-6 pb-4 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Seu nome"
                  className="pl-9 h-10"
                  value={data.name}
                  onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-9 h-10"
                  value={data.email}
                  onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone" className="text-sm">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                className="pl-9 h-10"
                value={data.phone}
                onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Modalidade</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "presencial", label: "Presencial" },
                { value: "online", label: "Online" },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={data.modality === opt.value ? "default" : "outline"}
                  className="h-10 text-sm"
                  onClick={() => setData((d) => ({ ...d, modality: opt.value as Modality }))}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date" className="text-sm">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between h-10 text-sm"
                  >
                    {data.date ? format(new Date(`${data.date}T00:00:00`), "dd/MM/yyyy") : "Selecione"}
                    <CalendarIcon className="w-4 h-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => setSelectedDate(day ?? undefined)}
                    disabled={(day) => !!(availabilityDisabledDays && availabilityDisabledDays.has(day.getDay()))}
                    initialFocus
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label htmlFor="time" className="text-sm">Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  id="time"
                  name="time"
                  className="pl-9 pr-3 h-10 w-full rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={data.time}
                  onChange={(e) => setData((d) => ({ ...d, time: e.target.value }))}
                  aria-invalid={Boolean(error) && !data.time}
                  required
                >
                  {!data.date && <option value="">Escolha uma data para ver horários</option>}
                  {data.date && <option value="">Selecione</option>}
                  {data.date && isLoadingSlots && <option value="" disabled>Carregando horários...</option>}
                  {data.date && slotOptions.map(({ time }) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                  {noSlots && <option value="" disabled>Nenhum horário disponível</option>}
                  {slotsQuery.error && <option value="" disabled>Erro ao carregar horários</option>}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="note" className="text-sm">Observações (opcional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Breve contexto ou dúvida"
              value={data.note}
              onChange={(e) => setData((d) => ({ ...d, note: e.target.value }))}
              className="min-h-20 sm:min-h-24 text-sm"
            />
          </div>

          {error ? <p className="text-sm text-red-600" role="alert" aria-live="assertive">{error}</p> : null}
          {submitted ? <p className="text-sm text-green-600" role="status" aria-live="polite">Pedido enviado! Você verá na Comunicação &gt; Mensagens.</p> : null}
        </form>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="quick-booking-form"
            className="w-full sm:w-auto"
            isLoading={loading}
            loadingText="Enviando..."
            disabled={loading || isRequiredMissing}
          >
            Solicitar horário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

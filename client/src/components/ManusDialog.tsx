import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Clock, Mail, Phone, User } from "lucide-react";

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
import { cn } from "@/lib/utils";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isRequiredMissing) {
      setError("Preencha nome, email, data e horário.");
      return;
    }
    setLoading(true);
    // Placeholder: integração real virá na fase backend
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      onSuccess?.();
    }, 600);
  };

  const timeOptions = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  const dialogOpen = onOpenChange ? open : internalOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-semibold text-foreground">Agendamento rápido</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Informe dados essenciais e escolha um horário. Confirmação real será feita na fase de backend.
          </DialogDescription>
        </DialogHeader>

        <form id="quick-booking-form" onSubmit={handleSubmit} className="px-6 pb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Seu nome"
                  className="pl-9"
                  value={data.name}
                  onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                  aria-invalid={Boolean(error) && !data.name}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="seuemail@exemplo.com"
                  className="pl-9"
                  value={data.email}
                  onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                  aria-invalid={Boolean(error) && !data.email}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  className="pl-9"
                  value={data.phone}
                  onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="modality">Modalidade</Label>
              <div className="flex gap-2">
                {[{ value: "presencial", label: "Presencial" }, { value: "online", label: "Online" }].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={data.modality === opt.value ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setData((d) => ({ ...d, modality: opt.value as Modality }))}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date">Data</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  name="date"
                  className="pl-9"
                  value={data.date}
                  onChange={(e) => setData((d) => ({ ...d, date: e.target.value }))}
                  aria-invalid={Boolean(error) && !data.date}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="time">Horário</Label>
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
                  <option value="">Selecione</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="note">Observações (opcional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Breve contexto ou dúvida"
              value={data.note}
              onChange={(e) => setData((d) => ({ ...d, note: e.target.value }))}
              className="min-h-[96px]"
            />
          </div>

          {error ? <p className="text-sm text-red-600" role="alert" aria-live="assertive">{error}</p> : null}
          {submitted ? <p className="text-sm text-green-600" role="status" aria-live="polite">Pedido registrado (placeholder). Confirmaremos por email quando o backend estiver ativo.</p> : null}
        </form>

        <DialogFooter className="px-6 pb-6 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="quick-booking-form"
            className="w-full"
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

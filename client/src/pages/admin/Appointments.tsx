import { useState, useMemo, useEffect } from "react";
import { Calendar, MapPin, Clock, Trash2, Check, X, Plus, ChevronLeft, ChevronRight, Filter, DollarSign, Tag, UserX, PauseCircle, Repeat, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb";
import { toast } from "sonner";

// Define types that match DB strings but used as unions in UI
type AppointmentStatus = "pendente" | "confirmado" | "concluido" | "cancelado" | "falta" | "adiado" | "reagendado";
type AppointmentType = "presencial" | "online";
type PaymentStatus = "pendente" | "pago" | "parcial" | "isento" | "reembolsado";

interface Appointment {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string | Date; // Can be string from JSON or Date from SuperJSON
  appointmentTime: string;
  modality: string; // DB varchar
  status: string; // DB varchar
  paymentStatus?: string | null; // DB varchar
  tags?: string | null;
  notes?: string | null;
  createdAt?: string | Date;
}

interface ConflictState {
  appointmentId: number;
  desiredDate: string;
  desiredTime: string;
  suggestions: Array<{ date: string; time: string }>;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pendente: { label: "Pendente", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  confirmado: { label: "Confirmado", color: "text-blue-700", bgColor: "bg-blue-100" },
  concluido: { label: "Realizado", color: "text-green-700", bgColor: "bg-green-100" },
  falta: { label: "Falta", color: "text-rose-700", bgColor: "bg-rose-100" },
  adiado: { label: "Adiado", color: "text-orange-700", bgColor: "bg-orange-100" },
  reagendado: { label: "Reagendado", color: "text-indigo-700", bgColor: "bg-indigo-100" },
  cancelado: { label: "Cancelado", color: "text-red-700", bgColor: "bg-red-100" },
};

const paymentConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pendente: { label: "A Pagar", color: "text-orange-700", bgColor: "bg-orange-100" },
  pago: { label: "Pago", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  parcial: { label: "Parcial", color: "text-amber-700", bgColor: "bg-amber-100" },
  isento: { label: "Isento", color: "text-slate-700", bgColor: "bg-slate-200" },
  reembolsado: { label: "Reembolsado", color: "text-gray-700", bgColor: "bg-gray-200" },
};

function toDateKey(value: string | Date): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toTimeLabel(value: string): string {
  return String(value).slice(0, 5);
}

function getStartOfWeek(reference: Date): Date {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function shiftDateISO(dateInput: string | Date, days: number): string {
  const d = new Date(toDateKey(dateInput));
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const weekTimeSlots = Array.from({ length: 12 }).map((_, idx) => {
  const hour = 8 + idx;
  return `${String(hour).padStart(2, "0")}:00`;
});

function getStatusIcon(status: string) {
  if (status === "falta") return UserX;
  if (status === "adiado") return PauseCircle;
  if (status === "reagendado") return Repeat;
  return Circle;
}

const typeConfig: Record<string, { label: string; icon: typeof MapPin }> = {
  presencial: { label: "Presencial", icon: MapPin },
  online: { label: "Online", icon: Calendar },
};

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month" | "list">("week");
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "all">("all");
  const [selectedType, setSelectedType] = useState<AppointmentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "today" | "week" | "unpaid" | "falta" | "reagendado">("all");
  const [weekReference, setWeekReference] = useState(new Date());
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [conflictState, setConflictState] = useState<ConflictState | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Edit states
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>("pendente");

  // Create Manual State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [recurrenceMode, setRecurrenceMode] = useState<"none" | "weekly" | "biweekly" | "monthly">("none");
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [createForm, setCreateForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTime: "09:00",
    modality: "presencial" as AppointmentType,
    status: "confirmado" as AppointmentStatus,
    paymentStatus: "pendente" as PaymentStatus,
    notes: "",
    tags: ""
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasPrefill = [
      "clientName",
      "clientEmail",
      "clientPhone",
      "appointmentDate",
      "appointmentTime",
      "modality",
      "notes",
      "sourceMessageId",
    ].some((key) => params.has(key));

    if (!hasPrefill) return;

    const modality = params.get("modality") === "online" ? "online" : "presencial";
    const sourceMessageId = params.get("sourceMessageId");
    const notesFromParam = params.get("notes") || "";
    const noteWithSource = sourceMessageId
      ? `${notesFromParam}\nMensagem origem: #${sourceMessageId}`.trim()
      : notesFromParam;

    setCreateForm((prev) => ({
      ...prev,
      clientName: params.get("clientName") || prev.clientName,
      clientEmail: params.get("clientEmail") || prev.clientEmail,
      clientPhone: params.get("clientPhone") || prev.clientPhone,
      appointmentDate: params.get("appointmentDate") || prev.appointmentDate,
      appointmentTime: params.get("appointmentTime") || prev.appointmentTime,
      modality,
      notes: noteWithSource || prev.notes,
      status: "confirmado",
      paymentStatus: "pendente",
    }));

    setIsCreateOpen(true);

    const cleanPath = window.location.pathname;
    window.history.replaceState({}, "", cleanPath);
  }, []);

  // Fetch appointments
  const appointmentsQuery = trpc.booking.list.useQuery({});
  const appointments = (appointmentsQuery.data || []) as Appointment[];

  // Debug logs
  console.log('🔍 Appointments data:', appointmentsQuery.data);
  console.log('🔍 Appointments isLoading:', appointmentsQuery.isLoading);
  console.log('🔍 Appointments error:', appointmentsQuery.error);
  console.log('🔍 Appointments array:', appointments);

  // Mutations
  const createManualMutation = (trpc.booking as any).createManual.useMutation({
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar agendamento");
    },
  });

  const updateMutation = trpc.booking.update.useMutation({
    onSuccess: () => {
      toast.success("Agendamento atualizado!");
      appointmentsQuery.refetch();
      // Close dialog if open (optional, maybe keep open for more edits)
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar agendamento");
    },
  });

  const suggestAlternativesQuery = trpc.booking.suggestAlternatives.useMutation();
  const patientHistoryQuery = trpc.booking.historyByClient.useQuery(
    selectedAppointment
      ? {
          clientEmail: selectedAppointment.clientEmail,
          clientPhone: selectedAppointment.clientPhone,
          clientName: selectedAppointment.clientName,
          limit: 60,
        }
      : { limit: 60 },
    { enabled: !!selectedAppointment }
  );

  // Alias for compatibility
  const confirmMutation = updateMutation;

  const cancelMutation = trpc.booking.cancel.useMutation({
    onSuccess: () => {
      toast.success("Agendamento cancelado!");
      appointmentsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cancelar agendamento");
    },
  });

  // Usar apenas dados reais
  const displayAppointments = appointments;

  // Filtrar agendamentos
  const filteredAppointments = useMemo(() => {
    return displayAppointments.filter((apt) => {
      if (selectedStatus !== "all" && apt.status !== selectedStatus) return false;
      if (selectedType !== "all" && apt.modality !== selectedType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          apt.clientName,
          apt.clientEmail,
          apt.clientPhone,
          apt.tags || "",
          apt.notes || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      const todayKey = new Date().toISOString().slice(0, 10);
      const aptDate = toDateKey(apt.appointmentDate);
      const payment = apt.paymentStatus || "pendente";

      if (quickFilter === "today" && aptDate !== todayKey) return false;
      if (quickFilter === "unpaid" && !["pendente", "parcial"].includes(payment)) return false;
      if (quickFilter === "falta" && apt.status !== "falta") return false;
      if (quickFilter === "reagendado" && apt.status !== "reagendado") return false;
      if (quickFilter === "week") {
        const start = getStartOfWeek(weekReference);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const d = new Date(aptDate);
        if (d < start || d > end) return false;
      }

      return true;
    });
  }, [displayAppointments, selectedStatus, selectedType, searchQuery, quickFilter, weekReference]);

  // Agendamentos do mês selecionado
  const monthAppointments = useMemo(() => {
    const monthStr = currentDate.toISOString().slice(0, 7);
    return filteredAppointments.filter((apt) => {
        // Ensure we handle both Date objects (from superjson) and strings (fallback)
        const dateStr = apt.appointmentDate instanceof Date
            ? apt.appointmentDate.toISOString()
            : String(apt.appointmentDate);
        return dateStr.startsWith(monthStr);
    });
  }, [filteredAppointments, currentDate]);

  // Agrupar agendamentos por data (para view de calendário)
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    monthAppointments.forEach((apt) => {
      const dateKey = toDateKey(apt.appointmentDate);

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [monthAppointments]);

  const weekDays = useMemo(() => {
    const start = getStartOfWeek(weekReference);
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      return d;
    });
  }, [weekReference]);

  const weekAppointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    weekDays.forEach((day) => {
      grouped[day.toISOString().slice(0, 10)] = [];
    });
    filteredAppointments.forEach((apt) => {
      const key = toDateKey(apt.appointmentDate);
      if (!grouped[key]) return;
      grouped[key].push(apt);
    });
    Object.values(grouped).forEach((items) => items.sort((a, b) => toTimeLabel(a.appointmentTime).localeCompare(toTimeLabel(b.appointmentTime))));
    return grouped;
  }, [filteredAppointments, weekDays]);

  // Próximos agendamentos (próximos 7 dias)
  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return filteredAppointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && aptDate <= nextWeek;
    }).sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      const dateCompare = dateA.getTime() - dateB.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.appointmentTime.localeCompare(b.appointmentTime);
    }).slice(0, 5);
  }, [filteredAppointments]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      total: filteredAppointments.length,
      pending: filteredAppointments.filter((a) => a.status === "pendente").length,
      confirmed: filteredAppointments.filter((a) => a.status === "confirmado").length,
      completed: filteredAppointments.filter((a) => a.status === "concluido").length,
      missed: filteredAppointments.filter((a) => a.status === "falta").length,
      unpaid: filteredAppointments.filter((a) => ["pendente", "parcial"].includes(a.paymentStatus || "pendente")).length,
    };
  }, [filteredAppointments]);

  // Navegação de mês
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const previousWeek = () => {
    const next = new Date(weekReference);
    next.setDate(next.getDate() - 7);
    setWeekReference(next);
  };

  const nextWeek = () => {
    const next = new Date(weekReference);
    next.setDate(next.getDate() + 7);
    setWeekReference(next);
  };

  const handleSaveDetails = () => {
    if (!selectedAppointment) return;
    updateMutation.mutate({
      id: selectedAppointment.id,
      notes: editNotes,
      tags: editTags,
      paymentStatus: editPaymentStatus,
    });
  };

  const handleCreate = async () => {
    const occurrences = Math.max(1, Math.min(24, recurrenceCount));
    const dayStep = recurrenceMode === "weekly" ? 7 : recurrenceMode === "biweekly" ? 15 : recurrenceMode === "monthly" ? 30 : 0;

    try {
      const payload = { ...createForm };
      for (let i = 0; i < occurrences; i += 1) {
        const appointmentDate = dayStep > 0 ? shiftDateISO(payload.appointmentDate, dayStep * i) : payload.appointmentDate;
        await createManualMutation.mutateAsync({
          ...payload,
          appointmentDate,
          notes: occurrences > 1 ? `${payload.notes || ""}\nRecorrência ${i + 1}/${occurrences}`.trim() : payload.notes,
        });
      }

      toast.success(occurrences > 1 ? `${occurrences} sessões criadas com sucesso!` : "Agendamento criado com sucesso!");
      setIsCreateOpen(false);
      setRecurrenceMode("none");
      setRecurrenceCount(1);
      setCreateForm({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        appointmentDate: new Date().toISOString().slice(0, 10),
        appointmentTime: "09:00",
        modality: "presencial",
        status: "confirmado",
        paymentStatus: "pendente",
        notes: "",
        tags: ""
      });
      appointmentsQuery.refetch();
    } catch {
      // Error already handled by mutation onError
    }
  };

  const handleQuickReschedule = (apt: Appointment, days: number) => {
    const newDate = shiftDateISO(apt.appointmentDate, days);
    void updateAppointmentWithConflictHandling(apt, {
      id: apt.id,
      appointmentDate: newDate,
      appointmentTime: toTimeLabel(apt.appointmentTime),
      status: "reagendado",
      notes: `${apt.notes || ""}\nRemarcado +${days} dias em ${new Date().toLocaleDateString("pt-BR")}`.trim(),
    });
  };

  const handleGenerateNextSession = async (source: Appointment, days: number = 7) => {
    const nextDate = shiftDateISO(source.appointmentDate, days);
    const payload = {
      clientName: source.clientName,
      clientEmail: source.clientEmail,
      clientPhone: source.clientPhone,
      appointmentDate: nextDate,
      appointmentTime: toTimeLabel(source.appointmentTime),
      modality: (source.modality as AppointmentType) || "presencial",
      status: "pendente" as AppointmentStatus,
      paymentStatus: "pendente" as PaymentStatus,
      notes: `${source.notes || ""}\nPróxima sessão gerada automaticamente da sessão #${source.id}`.trim(),
      tags: source.tags || "",
    };

    try {
      await createManualMutation.mutateAsync(payload);
      toast.success("Próxima sessão gerada com sucesso.");
      appointmentsQuery.refetch();
      patientHistoryQuery.refetch();
    } catch (error: any) {
      const message = String(error?.message || "");
      if (!message.includes("Horário já ocupado")) return;

      const alternatives = await suggestAlternativesQuery.mutateAsync({
        date: payload.appointmentDate,
        time: payload.appointmentTime,
        maxSuggestions: 1,
        daysToScan: 30,
      });
      const first = alternatives.suggestions?.[0];
      if (!first) {
        toast.error("Não foi possível gerar próxima sessão: sem horário livre sugerido.");
        return;
      }

      await createManualMutation.mutateAsync({
        ...payload,
        appointmentDate: first.date,
        appointmentTime: first.time,
        status: "reagendado",
        notes: `${payload.notes}\nConflito detectado, criado em horário sugerido.`.trim(),
      });
      toast.success(`Próxima sessão criada em horário sugerido: ${new Date(first.date).toLocaleDateString("pt-BR")} ${first.time}.`);
      appointmentsQuery.refetch();
      patientHistoryQuery.refetch();
    }
  };

  const updateAppointmentWithConflictHandling = async (
    appointment: Appointment,
    payload: {
      id: number;
      status?: AppointmentStatus;
      paymentStatus?: PaymentStatus;
      appointmentDate?: string;
      appointmentTime?: string;
      modality?: AppointmentType;
      tags?: string;
      notes?: string;
    }
  ) => {
    try {
      await updateMutation.mutateAsync(payload);
      setConflictState(null);
    } catch (error: any) {
      const message = String(error?.message || "");
      const desiredDate = payload.appointmentDate || toDateKey(appointment.appointmentDate);
      const desiredTime = payload.appointmentTime || toTimeLabel(appointment.appointmentTime);

      if (message.includes("Já existe outro agendamento")) {
        const response = await suggestAlternativesQuery.mutateAsync({
          date: desiredDate,
          time: desiredTime,
          maxSuggestions: 8,
          daysToScan: 30,
        });

        setConflictState({
          appointmentId: appointment.id,
          desiredDate,
          desiredTime,
          suggestions: response.suggestions || [],
        });

        toast.error("Horário ocupado. Escolha uma das sugestões abaixo.");
        return;
      }

      throw error;
    }
  };

  const handleDropToSlot = (appointmentId: number, targetDate: string, targetTime: string) => {
    const apt = filteredAppointments.find((item) => item.id === appointmentId);
    if (!apt) return;

    const currentDate = toDateKey(apt.appointmentDate);
    const currentTime = toTimeLabel(apt.appointmentTime);
    if (currentDate === targetDate && currentTime === targetTime) return;

    void updateAppointmentWithConflictHandling(apt, {
      id: apt.id,
      appointmentDate: targetDate,
      appointmentTime: targetTime,
      status: "reagendado",
      notes: `${apt.notes || ""}\nArrastado para ${new Date(targetDate).toLocaleDateString("pt-BR")} às ${targetTime}`.trim(),
    });
  };

  // Render calendário
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Days de outros meses
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
    }

    // Days do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayAppointments = appointmentsByDate[dateStr] || [];
      const today = new Date();
      const isToday = dateStr === today.toISOString().split("T")[0];

      days.push(
        <div key={day} className={`h-24 border p-2 overflow-hidden ${isToday ? "bg-blue-50" : ""}`}>
          <div className={`text-sm font-semibold ${isToday ? "text-blue-600" : ""}`}>{day}</div>
          <div className="space-y-1 mt-1">
            {dayAppointments.slice(0, 2).map((apt) => (
              <div
                key={apt.id}
                className={`text-xs px-2 py-1 rounded truncate cursor-pointer ${statusConfig[apt.status].bgColor} ${statusConfig[apt.status].color}`}
              >
                {toTimeLabel(apt.appointmentTime)} - {apt.clientName}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-xs text-gray-500 px-2">+{dayAppointments.length - 2} mais</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="admin-section-light rounded-lg p-6">
          <AdminBreadcrumb className="mb-2" />

          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Agendamentos</h1>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Plus size={20} />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento Manual</DialogTitle>
                  <DialogDescription>Adicione um paciente ou agendamento que não veio pelo site.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome do Paciente</Label>
                    <Input
                      value={createForm.clientName}
                      onChange={(e) => setCreateForm({...createForm, clientName: e.target.value})}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={createForm.clientEmail}
                      onChange={(e) => setCreateForm({...createForm, clientEmail: e.target.value})}
                      placeholder="joao@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone (opcional)</Label>
                    <Input
                      value={createForm.clientPhone}
                      onChange={(e) => setCreateForm({...createForm, clientPhone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={createForm.appointmentDate}
                      onChange={(e) => setCreateForm({...createForm, appointmentDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={createForm.appointmentTime}
                      onChange={(e) => setCreateForm({...createForm, appointmentTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modalidade</Label>
                    <Select
                      value={createForm.modality}
                      onValueChange={(v) => setCreateForm({...createForm, modality: v as AppointmentType})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={createForm.status}
                      onValueChange={(v) => setCreateForm({...createForm, status: v as AppointmentStatus})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="adiado">Adiado</SelectItem>
                        <SelectItem value="reagendado">Reagendado</SelectItem>
                        <SelectItem value="falta">Falta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status Pagamento</Label>
                    <Select
                      value={createForm.paymentStatus}
                      onValueChange={(v) => setCreateForm({...createForm, paymentStatus: v as PaymentStatus})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">A Pagar</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="parcial">Parcial</SelectItem>
                        <SelectItem value="isento">Isento</SelectItem>
                        <SelectItem value="reembolsado">Reembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recorrência</Label>
                    <Select value={recurrenceMode} onValueChange={(v) => setRecurrenceMode(v as "none" | "weekly" | "biweekly" | "monthly")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Somente esta sessão</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade de Sessões</Label>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={recurrenceCount}
                      onChange={(e) => setRecurrenceCount(Number(e.target.value || 1))}
                      disabled={recurrenceMode === "none"}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                     <Label>Tags (separadas por vírgula)</Label>
                     <Input
                       value={createForm.tags}
                       onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                       placeholder="Ex: retorno, primeira consulta, ansiedade"
                     />
                  </div>
                  <div className="col-span-2 space-y-2">
                     <Label>Notas/Observações</Label>
                     <Textarea
                       value={createForm.notes}
                       onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                       placeholder="Observações internas..."
                     />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreate} disabled={createManualMutation.isPending}>
                    {createManualMutation.isPending ? "Criando..." : "Criar Agendamento"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="admin-section-dark rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-yellow-500">
              <div className="text-sm text-gray-600">Pendentes</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-green-500">
              <div className="text-sm text-gray-600">Confirmados</div>
              <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-purple-500">
              <div className="text-sm text-gray-600">Realizados</div>
              <div className="text-3xl font-bold text-purple-600">{stats.completed}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-rose-500">
              <div className="text-sm text-gray-600">Faltas</div>
              <div className="text-3xl font-bold text-rose-600">{stats.missed}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-orange-500">
              <div className="text-sm text-gray-600">Não Pagos</div>
              <div className="text-3xl font-bold text-orange-600">{stats.unpaid}</div>
            </Card>
          </div>
        </div>

        {/* View Toggle & Filtros */}
        <div className="admin-section-light rounded-lg p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  onClick={() => setViewMode("week")}
                  className="gap-2"
                >
                  <Calendar size={16} />
                  Semana
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  onClick={() => setViewMode("month")}
                  className="gap-2"
                >
                  <Calendar size={16} />
                  Mês
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <Calendar size={16} />
                  Lista
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="h-10" variant={quickFilter === "all" ? "default" : "outline"} onClick={() => setQuickFilter("all")}>Todos</Button>
                <Button size="sm" className="h-10" variant={quickFilter === "today" ? "default" : "outline"} onClick={() => setQuickFilter("today")}>Hoje</Button>
                <Button size="sm" className="h-10" variant={quickFilter === "week" ? "default" : "outline"} onClick={() => setQuickFilter("week")}>Esta semana</Button>
                <Button size="sm" className="h-10" variant={quickFilter === "unpaid" ? "default" : "outline"} onClick={() => setQuickFilter("unpaid")}>Não pagos</Button>
                <Button size="sm" className="h-10" variant={quickFilter === "falta" ? "default" : "outline"} onClick={() => setQuickFilter("falta")}>Faltas</Button>
                <Button size="sm" className="h-10" variant={quickFilter === "reagendado" ? "default" : "outline"} onClick={() => setQuickFilter("reagendado")}>Reagendados</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por paciente, email, telefone, tags..."
                className="max-w-xl"
              />

              <div className="flex flex-wrap gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={previousWeek}
                  className="gap-2"
                >
                  <ChevronLeft size={14} />
                  Semana Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextWeek}
                  className="gap-2"
                >
                  Próxima Semana
                  <ChevronRight size={14} />
                </Button>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | "all")}
                  className="h-10 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pendente">Pendentes</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="concluido">Realizados</option>
                  <option value="falta">Falta</option>
                  <option value="adiado">Adiado</option>
                  <option value="reagendado">Reagendado</option>
                  <option value="cancelado">Cancelados</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as AppointmentType | "all")}
                  className="h-10 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="all">Todas as Modalidades</option>
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-section-dark rounded-lg p-6">
          {conflictState && (
            <Card className="p-4 mb-4 border-orange-300 bg-orange-50">
              <div className="text-sm font-semibold text-orange-900">Conflito detectado</div>
              <div className="text-sm text-orange-800 mb-3">
                Horário solicitado: {new Date(conflictState.desiredDate).toLocaleDateString("pt-BR")} às {conflictState.desiredTime}
              </div>
              <div className="flex flex-wrap gap-2">
                {conflictState.suggestions.length > 0 ? (
                  conflictState.suggestions.map((slot) => (
                    <Button
                      key={`${slot.date}-${slot.time}`}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const apt = filteredAppointments.find((a) => a.id === conflictState.appointmentId);
                        if (!apt) return;
                        void updateAppointmentWithConflictHandling(apt, {
                          id: apt.id,
                          appointmentDate: slot.date,
                          appointmentTime: slot.time,
                          status: "reagendado",
                          notes: `${apt.notes || ""}\nSugestão aplicada em ${new Date().toLocaleDateString("pt-BR")}`.trim(),
                        });
                      }}
                    >
                      {new Date(slot.date).toLocaleDateString("pt-BR")} {slot.time}
                    </Button>
                  ))
                ) : (
                  <span className="text-sm text-orange-700">Nenhuma sugestão encontrada no período.</span>
                )}
                <Button size="sm" variant="ghost" onClick={() => setConflictState(null)}>Fechar</Button>
              </div>
            </Card>
          )}

          {viewMode === "week" ? (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Visão Semanal</h2>
                <div className="text-sm text-gray-600">
                  {weekDays[0].toLocaleDateString("pt-BR")} - {weekDays[6].toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
                {weekDays.map((day) => {
                  const dateKey = day.toISOString().slice(0, 10);
                  const dayList = weekAppointmentsByDate[dateKey] || [];
                  const isToday = dateKey === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={dateKey} className={`rounded-lg border p-3 min-h-52 ${isToday ? "bg-blue-50 border-blue-300" : "bg-white"}`}>
                      <div className="mb-2">
                        <div className="text-xs text-gray-500">{day.toLocaleDateString("pt-BR", { weekday: "short" })}</div>
                        <div className="font-semibold text-gray-900">{day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</div>
                      </div>

                      <div className="space-y-1">
                        {weekTimeSlots.map((slotTime) => {
                          const slotKey = `${dateKey}_${slotTime}`;
                          const slotAppointments = dayList.filter((apt) => toTimeLabel(apt.appointmentTime) === slotTime);
                          const isOver = dragOverSlot === slotKey;

                          return (
                            <div
                              key={slotKey}
                              className={`rounded border px-2 py-1 min-h-10 ${isOver ? "bg-blue-100 border-blue-400" : "bg-white"}`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverSlot(slotKey);
                              }}
                              onDragLeave={() => setDragOverSlot((prev) => (prev === slotKey ? null : prev))}
                              onDrop={(e) => {
                                e.preventDefault();
                                const appointmentId = Number(e.dataTransfer.getData("appointment-id"));
                                setDragOverSlot(null);
                                if (Number.isFinite(appointmentId)) {
                                  handleDropToSlot(appointmentId, dateKey, slotTime);
                                }
                              }}
                            >
                              <div className="text-[10px] text-gray-500 mb-1">{slotTime}</div>
                              {slotAppointments.length > 0 ? (
                                slotAppointments.map((apt) => {
                                  const StatusIcon = getStatusIcon(apt.status);
                                  return (
                                    <div
                                      key={apt.id}
                                      className="rounded border p-2 bg-gray-50 cursor-move"
                                      draggable
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData("appointment-id", String(apt.id));
                                        e.dataTransfer.effectAllowed = "move";
                                      }}
                                    >
                                      <div className="text-xs font-medium text-gray-900 truncate">{toTimeLabel(apt.appointmentTime)} - {apt.clientName}</div>
                                      <div className="mt-1 flex items-center gap-1 flex-wrap">
                                        <Badge className={statusConfig[apt.status]?.bgColor || "bg-gray-100"}>
                                          <span className={`flex items-center gap-1 ${statusConfig[apt.status]?.color || "text-gray-700"}`}>
                                            <StatusIcon size={12} />
                                            {statusConfig[apt.status]?.label || apt.status}
                                          </span>
                                        </Badge>
                                        {apt.paymentStatus && paymentConfig[apt.paymentStatus] && (
                                          <Badge className={paymentConfig[apt.paymentStatus].bgColor}>
                                            <span className={paymentConfig[apt.paymentStatus].color}>{paymentConfig[apt.paymentStatus].label}</span>
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          ) : viewMode === "list" ? (
          <div className="space-y-4">
            {/* Próximos Agendamentos */}
            <Card className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos 7 Dias</h2>
              <div className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-gray-900">{apt.clientName}</div>
                          <Badge className={statusConfig[apt.status].bgColor}>
                            <span className={statusConfig[apt.status].color}>{statusConfig[apt.status].label}</span>
                          </Badge>
                          {apt.paymentStatus && paymentConfig[apt.paymentStatus] && (
                             <Badge className={paymentConfig[apt.paymentStatus].bgColor}>
                               <span className={paymentConfig[apt.paymentStatus].color}>{paymentConfig[apt.paymentStatus].label}</span>
                             </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 flex gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(apt.appointmentDate).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {toTimeLabel(apt.appointmentTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            {typeConfig[apt.modality].icon === MapPin ? (
                              <MapPin size={14} />
                            ) : (
                              <Calendar size={14} />
                            )}
                            {typeConfig[apt.modality].label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">Nenhum agendamento nos próximos 7 dias</div>
                )}
              </div>
            </Card>

            {/* Lista Completa de Agendamentos */}
            <Card className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paciente</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data / Hora</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pagamento</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{apt.clientName}</div>
                              <div className="text-sm text-gray-600">{apt.clientEmail}</div>
                              {apt.tags && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {apt.tags.split(",").map(t => (
                                    <span key={t} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{t.trim()}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(apt.appointmentDate).toLocaleDateString("pt-BR")}
                            </div>
                            <div className="text-sm text-gray-600">{toTimeLabel(apt.appointmentTime)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">
                              {typeConfig[apt.modality].label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={statusConfig[apt.status].bgColor}>
                              <span className={statusConfig[apt.status].color}>{statusConfig[apt.status].label}</span>
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                             {apt.paymentStatus && paymentConfig[apt.paymentStatus] ? (
                                <Badge className={paymentConfig[apt.paymentStatus].bgColor}>
                                  <span className={paymentConfig[apt.paymentStatus].color}>{paymentConfig[apt.paymentStatus].label}</span>
                                </Badge>
                             ) : (
                               <span className="text-sm text-gray-400">-</span>
                             )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <Button size="sm" variant="outline" onClick={() => handleQuickReschedule(apt, 7)}>+7d</Button>
                              <Button size="sm" variant="outline" onClick={() => handleQuickReschedule(apt, 15)}>+15d</Button>
                              <Button size="sm" variant="outline" onClick={() => handleQuickReschedule(apt, 30)}>+30d</Button>
                              <Button size="sm" variant="outline" onClick={() => void updateAppointmentWithConflictHandling(apt, { id: apt.id, status: "falta" })}>Falta</Button>
                              <Button size="sm" variant="outline" onClick={() => void updateAppointmentWithConflictHandling(apt, { id: apt.id, status: "adiado" })}>Adiar</Button>
                              <Button size="sm" variant="outline" onClick={() => void updateAppointmentWithConflictHandling(apt, { id: apt.id, paymentStatus: "pago" })}>Pago</Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAppointment(apt);
                                      setEditNotes(apt.notes || "");
                                      setEditTags(apt.tags || "");
                                      setEditPaymentStatus((apt.paymentStatus as PaymentStatus) || "pendente");
                                    }}
                                  >
                                    Detalhes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md w-[95vw] max-h-[88vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes do Agendamento</DialogTitle>
                                  </DialogHeader>
                                  {selectedAppointment && (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Paciente</label>
                                        <div className="mt-1 text-gray-900 font-medium">
                                          {selectedAppointment.clientName}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <div className="mt-1 text-gray-900">{selectedAppointment.clientEmail}</div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Telefone</label>
                                        <div className="mt-1 text-gray-900">{selectedAppointment.clientPhone}</div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Data</label>
                                          <div className="mt-1 text-gray-900">
                                            {new Date(selectedAppointment.appointmentDate).toLocaleDateString("pt-BR")}
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Hora</label>
                                          <div className="mt-1 text-gray-900">{toTimeLabel(selectedAppointment.appointmentTime)}</div>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Status Pagamento</label>
                                        <Select
                                            value={editPaymentStatus}
                                            onValueChange={(v) => setEditPaymentStatus(v as PaymentStatus)}
                                        >
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                            <SelectItem value="pendente">A Pagar</SelectItem>
                                            <SelectItem value="pago">Pago</SelectItem>
                                            <SelectItem value="parcial">Parcial</SelectItem>
                                            <SelectItem value="isento">Isento</SelectItem>
                                            <SelectItem value="reembolsado">Reembolsado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Tags</label>
                                        <Input
                                          value={editTags}
                                          onChange={(e) => setEditTags(e.target.value)}
                                          className="mt-1"
                                          placeholder="Ex: ansiedade, retorno"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Notas</label>
                                        <textarea
                                          value={editNotes}
                                          onChange={(e) => setEditNotes(e.target.value)}
                                          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          rows={3}
                                        />
                                      </div>

                                      <div>
                                        <div className="flex items-center justify-between gap-2">
                                          <label className="text-sm font-medium text-gray-700">Linha do Tempo do Paciente</label>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => selectedAppointment && handleGenerateNextSession(selectedAppointment, 7)}
                                          >
                                            Gerar próxima sessão
                                          </Button>
                                        </div>
                                        <div className="mt-2 border rounded-lg p-3 max-h-52 overflow-y-auto space-y-2 bg-gray-50">
                                          {patientHistoryQuery.isLoading ? (
                                            <div className="text-sm text-gray-500">Carregando histórico...</div>
                                          ) : (patientHistoryQuery.data || []).length === 0 ? (
                                            <div className="text-sm text-gray-500">Sem histórico anterior.</div>
                                          ) : (
                                            (patientHistoryQuery.data || []).map((item: Appointment) => (
                                              <div key={item.id} className="text-xs border-b pb-2 last:border-b-0">
                                                <div className="font-medium text-gray-900">
                                                  {new Date(item.appointmentDate).toLocaleDateString("pt-BR")} {toTimeLabel(item.appointmentTime)}
                                                </div>
                                                <div className="flex gap-2 mt-1 flex-wrap">
                                                  <Badge className={statusConfig[item.status]?.bgColor || "bg-gray-100"}>
                                                    <span className={statusConfig[item.status]?.color || "text-gray-700"}>{statusConfig[item.status]?.label || item.status}</span>
                                                  </Badge>
                                                  {item.paymentStatus && paymentConfig[item.paymentStatus] && (
                                                    <Badge className={paymentConfig[item.paymentStatus].bgColor}>
                                                      <span className={paymentConfig[item.paymentStatus].color}>{paymentConfig[item.paymentStatus].label}</span>
                                                    </Badge>
                                                  )}
                                                </div>
                                                {item.notes ? <div className="text-gray-600 mt-1 line-clamp-2">{item.notes}</div> : null}
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-2 flex-wrap">
                                        {selectedAppointment.status === "pendente" && (
                                          <Button 
                                            className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                                            onClick={() => {
                                              confirmMutation.mutate({ 
                                                id: selectedAppointment.id, 
                                                status: "confirmado" 
                                              });
                                            }}
                                            disabled={confirmMutation.isPending}
                                          >
                                            <Check size={16} />
                                            {confirmMutation.isPending ? "..." : "Confirmar"}
                                          </Button>
                                        )}
                                        {["pendente", "confirmado"].includes(selectedAppointment.status) && (
                                          <Button 
                                            variant="outline" 
                                            className="flex-1 gap-2 text-red-600 border-red-300 hover:bg-red-50"
                                            onClick={() => {
                                              cancelMutation.mutate({ id: selectedAppointment.id });
                                            }}
                                            disabled={cancelMutation.isPending}
                                          >
                                            <X size={16} />
                                            {cancelMutation.isPending ? "..." : "Cancelar"}
                                          </Button>
                                        )}
                                        {selectedAppointment.status === "confirmado" && (
                                          <Button 
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
                                            onClick={() => {
                                              confirmMutation.mutate({ 
                                                id: selectedAppointment.id, 
                                                status: "concluido" 
                                              });
                                            }}
                                            disabled={confirmMutation.isPending}
                                          >
                                            <Check size={16} />
                                            {confirmMutation.isPending ? "..." : "Realizado"}
                                          </Button>
                                        )}
                                        <Button
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => confirmMutation.mutate({ id: selectedAppointment.id, status: "falta" })}
                                        >
                                          Falta
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => confirmMutation.mutate({ id: selectedAppointment.id, status: "adiado" })}
                                        >
                                          Adiado
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => handleQuickReschedule(selectedAppointment, 7)}
                                        >
                                          Reag +7d
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => handleQuickReschedule(selectedAppointment, 15)}
                                        >
                                          Reag +15d
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => handleQuickReschedule(selectedAppointment, 30)}
                                        >
                                          Reag +30d
                                        </Button>
                                        <Button className="flex-1" onClick={handleSaveDetails} disabled={updateMutation.isPending}>
                                          {updateMutation.isPending ? "Salvando..." : "Salvar Notas/Tags"}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Nenhum agendamento encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => (
                    <Card key={apt.id} className="p-4">
                      <div className="space-y-3">
                        {/* Header with patient info */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm">{apt.clientName}</h3>
                            <p className="text-xs text-gray-600 mt-1">{apt.clientEmail}</p>
                            {apt.tags && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {apt.tags.split(",").slice(0, 3).map(t => (
                                  <span key={t} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{t.trim()}</span>
                                ))}
                                {apt.tags.split(",").length > 3 && (
                                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                    +{apt.tags.split(",").length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Date and time */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar size={12} />
                          <span>{new Date(apt.appointmentDate).toLocaleDateString("pt-BR")}</span>
                          <Clock size={12} />
                          <span>{toTimeLabel(apt.appointmentTime)}</span>
                        </div>

                        {/* Status and type row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {typeConfig[apt.modality].label}
                            </Badge>
                            <Badge className={`${statusConfig[apt.status].bgColor} text-xs`}>
                              <span className={statusConfig[apt.status].color}>
                                {statusConfig[apt.status].label}
                              </span>
                            </Badge>
                          </div>
                          {apt.paymentStatus && paymentConfig[apt.paymentStatus] && (
                            <Badge className={`${paymentConfig[apt.paymentStatus].bgColor} text-xs`}>
                              <span className={paymentConfig[apt.paymentStatus].color}>
                                {paymentConfig[apt.paymentStatus].label}
                              </span>
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end pt-2 border-t">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-10 px-3 text-sm"
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                  setEditNotes(apt.notes || "");
                                  setEditTags(apt.tags || "");
                                  setEditPaymentStatus((apt.paymentStatus as PaymentStatus) || "pendente");
                                }}
                              >
                                Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md w-[95vw] max-h-[88vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Detalhes do Agendamento</DialogTitle>
                              </DialogHeader>
                              {selectedAppointment && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Paciente</label>
                                    <div className="mt-1 text-gray-900 font-medium">
                                      {selectedAppointment.clientName}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <div className="mt-1 text-gray-900">{selectedAppointment.clientEmail}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Telefone</label>
                                    <div className="mt-1 text-gray-900">{selectedAppointment.clientPhone}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Data</label>
                                      <div className="mt-1 text-gray-900">
                                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString("pt-BR")}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Hora</label>
                                      <div className="mt-1 text-gray-900">{toTimeLabel(selectedAppointment.appointmentTime)}</div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Status Pagamento</label>
                                    <Select
                                        value={editPaymentStatus}
                                        onValueChange={(v) => setEditPaymentStatus(v as PaymentStatus)}
                                    >
                                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="pendente">A Pagar</SelectItem>
                                        <SelectItem value="pago">Pago</SelectItem>
                                        <SelectItem value="parcial">Parcial</SelectItem>
                                        <SelectItem value="isento">Isento</SelectItem>
                                        <SelectItem value="reembolsado">Reembolsado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Tags</label>
                                    <Input
                                      value={editTags}
                                      onChange={(e) => setEditTags(e.target.value)}
                                      className="mt-1"
                                      placeholder="Ex: ansiedade, retorno"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Notas</label>
                                    <textarea
                                      value={editNotes}
                                      onChange={(e) => setEditNotes(e.target.value)}
                                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      rows={3}
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between gap-2">
                                      <label className="text-sm font-medium text-gray-700">Linha do Tempo do Paciente</label>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => selectedAppointment && handleGenerateNextSession(selectedAppointment, 7)}
                                      >
                                        Gerar próxima sessão
                                      </Button>
                                    </div>
                                    <div className="mt-2 border rounded-lg p-3 max-h-52 overflow-y-auto space-y-2 bg-gray-50">
                                      {patientHistoryQuery.isLoading ? (
                                        <div className="text-sm text-gray-500">Carregando histórico...</div>
                                      ) : (patientHistoryQuery.data || []).length === 0 ? (
                                        <div className="text-sm text-gray-500">Sem histórico anterior.</div>
                                      ) : (
                                        (patientHistoryQuery.data || []).map((item: Appointment) => (
                                          <div key={item.id} className="text-xs border-b pb-2 last:border-b-0">
                                            <div className="font-medium text-gray-900">
                                              {new Date(item.appointmentDate).toLocaleDateString("pt-BR")} {toTimeLabel(item.appointmentTime)}
                                            </div>
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                              <Badge className={statusConfig[item.status]?.bgColor || "bg-gray-100"}>
                                                <span className={statusConfig[item.status]?.color || "text-gray-700"}>{statusConfig[item.status]?.label || item.status}</span>
                                              </Badge>
                                              {item.paymentStatus && paymentConfig[item.paymentStatus] && (
                                                <Badge className={paymentConfig[item.paymentStatus].bgColor}>
                                                  <span className={paymentConfig[item.paymentStatus].color}>{paymentConfig[item.paymentStatus].label}</span>
                                                </Badge>
                                              )}
                                            </div>
                                            {item.notes ? <div className="text-gray-600 mt-1 line-clamp-2">{item.notes}</div> : null}
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {selectedAppointment.status === "pendente" && (
                                      <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                                        onClick={() => {
                                          confirmMutation.mutate({ 
                                            id: selectedAppointment.id, 
                                            status: "confirmado" 
                                          });
                                        }}
                                        disabled={confirmMutation.isPending}
                                      >
                                        <Check size={16} />
                                        {confirmMutation.isPending ? "..." : "Confirmar"}
                                      </Button>
                                    )}
                                    {["pendente", "confirmado"].includes(selectedAppointment.status) && (
                                      <Button 
                                        variant="outline" 
                                        className="flex-1 gap-2 text-red-600 border-red-300 hover:bg-red-50"
                                        onClick={() => {
                                          cancelMutation.mutate({ id: selectedAppointment.id });
                                        }}
                                        disabled={cancelMutation.isPending}
                                      >
                                        <X size={16} />
                                        {cancelMutation.isPending ? "..." : "Cancelar"}
                                      </Button>
                                    )}
                                    {selectedAppointment.status === "confirmado" && (
                                      <Button 
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
                                        onClick={() => {
                                          confirmMutation.mutate({ 
                                            id: selectedAppointment.id, 
                                            status: "concluido" 
                                          });
                                        }}
                                        disabled={confirmMutation.isPending}
                                      >
                                        <Check size={16} />
                                        {confirmMutation.isPending ? "..." : "Realizado"}
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => confirmMutation.mutate({ id: selectedAppointment.id, status: "falta" })}
                                    >
                                      Falta
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => confirmMutation.mutate({ id: selectedAppointment.id, status: "adiado" })}
                                    >
                                      Adiado
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => handleQuickReschedule(selectedAppointment, 7)}
                                    >
                                      Reag +7d
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => handleQuickReschedule(selectedAppointment, 15)}
                                    >
                                      Reag +15d
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => handleQuickReschedule(selectedAppointment, 30)}
                                    >
                                      Reag +30d
                                    </Button>
                                    <Button className="flex-1" onClick={handleSaveDetails} disabled={updateMutation.isPending}>
                                      {updateMutation.isPending ? "Salvando..." : "Salvar Notas/Tags"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum agendamento encontrado
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : viewMode === "month" ? (
          <div className="space-y-4">
            {/* Calendário Header */}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={previousMonth}>
                  <ChevronLeft size={20} />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h2>
                <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={nextMonth}>
                  <ChevronRight size={20} />
                </Button>
              </div>

              {/* Dia da Semana */}
              <div className="grid grid-cols-7 gap-0 mb-2 border-b">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div key={day} className="h-10 flex items-center justify-center font-semibold text-gray-700 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias */}
              <div className="grid grid-cols-7 gap-0 border">
                {renderCalendar()}
              </div>
            </Card>

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 px-4 py-2 text-sm">
              {Object.entries(statusConfig).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${config.bgColor}`}></div>
                  <span className="text-gray-700">{config.label}</span>
                </div>
              ))}
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
               {Object.entries(paymentConfig).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${config.bgColor}`}></div>
                  <span className="text-gray-700">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
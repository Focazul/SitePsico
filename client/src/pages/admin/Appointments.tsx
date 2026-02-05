import { useState, useMemo } from "react";
import { Calendar, MapPin, Clock, Trash2, Check, X, Plus, ChevronLeft, ChevronRight, Filter, DollarSign, Tag } from "lucide-react";
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
type AppointmentStatus = "pendente" | "confirmado" | "concluido" | "cancelado";
type AppointmentType = "presencial" | "online";
type PaymentStatus = "pendente" | "pago" | "reembolsado";

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

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pendente: { label: "Pendente", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  confirmado: { label: "Confirmado", color: "text-blue-700", bgColor: "bg-blue-100" },
  concluido: { label: "Realizado", color: "text-green-700", bgColor: "bg-green-100" },
  cancelado: { label: "Cancelado", color: "text-red-700", bgColor: "bg-red-100" },
};

const paymentConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pendente: { label: "A Pagar", color: "text-orange-700", bgColor: "bg-orange-100" },
  pago: { label: "Pago", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  reembolsado: { label: "Reembolsado", color: "text-gray-700", bgColor: "bg-gray-200" },
};

const typeConfig: Record<string, { label: string; icon: typeof MapPin }> = {
  presencial: { label: "Presencial", icon: MapPin },
  online: { label: "Online", icon: Calendar },
};

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "all">("all");
  const [selectedType, setSelectedType] = useState<AppointmentType | "all">("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Edit states
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>("pendente");

  // Create Manual State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  // Fetch appointments
  const appointmentsQuery = trpc.booking.list.useQuery({
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });
  const appointments = (appointmentsQuery.data || []) as Appointment[];

  // Mutations
  const createManualMutation = (trpc.booking as any).createManual.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      setIsCreateOpen(false);
      appointmentsQuery.refetch();
      // Reset form
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
    },
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
      return true;
    });
  }, [displayAppointments, selectedStatus, selectedType]);

  // Agendamentos do mês selecionado
  const monthAppointments = useMemo(() => {
    const monthStr = currentDate.toISOString().slice(0, 7);
    return filteredAppointments.filter((apt) => {
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
      const dateKey = (apt.appointmentDate as unknown) instanceof Date
        ? (apt.appointmentDate as unknown as Date).toISOString().slice(0, 10)
        : String(apt.appointmentDate).slice(0, 10);

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [monthAppointments]);

  // Próximos agendamentos (próximos 7 dias)
  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return filteredAppointments.filter((apt) => {
      const dateVal = apt.appointmentDate as unknown;
      const dateStr = dateVal instanceof Date
        ? dateVal.toISOString()
        : String(dateVal);
      const aptDate = new Date(dateStr);
      return aptDate >= today && aptDate <= nextWeek;
    }).sort((a, b) => {
      const dateA = new Date(a.appointmentDate as string);
      const dateB = new Date(b.appointmentDate as string);
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
    };
  }, [filteredAppointments]);

  // Navegação de mês
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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

  const handleCreate = () => {
    createManualMutation.mutate(createForm);
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
                className={`text-xs px-2 py-1 rounded truncate cursor-pointer ${statusConfig[apt.status]?.bgColor || "bg-gray-100"} ${statusConfig[apt.status]?.color || "text-gray-700"}`}
                onClick={() => {
                  setSelectedAppointment(apt);
                  setEditNotes(apt.notes || "");
                  setEditTags(apt.tags || "");
                  setEditPaymentStatus((apt.paymentStatus as PaymentStatus) || "pendente");
                }}
              >
                {apt.appointmentTime} - {apt.clientName}
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
              <div className="grid grid-cols-2 gap-4 py-4">
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
                  <Label>Telefone</Label>
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
                    </SelectContent>
                  </Select>
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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>

        {/* View Toggle & Filtros */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <Calendar size={16} />
              Lista
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className="gap-2"
            >
              <Calendar size={16} />
              Calendário
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | "all")}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="confirmado">Confirmados</option>
              <option value="concluido">Realizados</option>
              <option value="cancelado">Cancelados</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AppointmentType | "all")}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">Todas as Modalidades</option>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {viewMode === "list" ? (
          <div className="space-y-4">
            {/* Próximos Agendamentos */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos 7 Dias</h2>
              <div className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-gray-900">{apt.clientName}</div>
                          <Badge className={statusConfig[apt.status]?.bgColor}>
                            <span className={statusConfig[apt.status]?.color}>{statusConfig[apt.status]?.label}</span>
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
                            {apt.appointmentTime}
                          </span>
                          <span className="flex items-center gap-1">
                            {typeConfig[apt.modality]?.icon === MapPin ? (
                              <MapPin size={14} />
                            ) : (
                              <Calendar size={14} />
                            )}
                            {typeConfig[apt.modality]?.label || apt.modality}
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
              <div className="overflow-x-auto">
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
                            <div className="text-sm text-gray-600">{apt.appointmentTime}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">
                              {typeConfig[apt.modality]?.label || apt.modality}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={statusConfig[apt.status]?.bgColor}>
                              <span className={statusConfig[apt.status]?.color}>{statusConfig[apt.status]?.label}</span>
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
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // Fix TS2345: Argument not assignable to 'SetStateAction<Appointment | null>'.
                                      // Ensure apt matches Appointment type
                                      setSelectedAppointment(apt as Appointment);
                                      setEditNotes(apt.notes || "");
                                      setEditTags(apt.tags || "");
                                      setEditPaymentStatus((apt.paymentStatus as PaymentStatus) || "pendente");
                                    }}
                                  >
                                    Detalhes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
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
                                          <div className="mt-1 text-gray-900">{selectedAppointment.appointmentTime}</div>
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
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendário Header */}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft size={20} />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h2>
                <Button variant="outline" size="sm" onClick={nextMonth}>
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
        )}
      </div>
    </DashboardLayout>
  );
}
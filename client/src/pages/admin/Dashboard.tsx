import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [dateRange] = useState<{ start?: string; end?: string }>({});

  // DEV MODE: Skip queries during testing
  const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';

  // Fetch appointments (próximos agendamentos)
  const appointmentsQuery = trpc.booking.list.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { enabled: !isDev } // Disable in dev mode for testing
  );

  // Fetch messages (mensagens não lidas)
  const messagesQuery = trpc.contact.getMessages.useQuery(
    {
      status: "novo",
    },
    { enabled: !isDev } // Disable in dev mode for testing
  );

  // Get unread count
  const unreadCountQuery = trpc.contact.getUnreadCount.useQuery(undefined, {
    enabled: !isDev, // Disable in dev mode for testing
  });

  // Calcular métricas
  const metrics = useMemo(() => {
    const appointments = appointmentsQuery.data || [];
    const pendingCount = appointments.filter((a) => a.status === "pendente").length;
    const confirmedCount = appointments.filter((a) => a.status === "confirmado").length;
    const messages = messagesQuery.data || [];

    return {
      totalAppointments: appointments.length,
      pendingAppointments: pendingCount,
      confirmedAppointments: confirmedCount,
      unreadMessages: unreadCountQuery.data?.count || 0,
      totalMessages: messages.length,
      weeklyTrend: generateWeeklyTrendData(appointments),
    };
  }, [appointmentsQuery.data, messagesQuery.data, unreadCountQuery.data]);

  const isLoading =
    appointmentsQuery.isLoading ||
    messagesQuery.isLoading ||
    unreadCountQuery.isLoading;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-8">
        {/* Breadcrumb */}
        <AdminBreadcrumb className="mb-2" />

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo! Aqui você visualiza o resumo de agendamentos, mensagens e atividades.
          </p>
        </div>

        {/* Cards de Métricas - Grid 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Total de Agendamentos */}
          <MetricCard
            title="Agendamentos"
            value={metrics.totalAppointments}
            icon={<Calendar className="h-5 w-5" />}
            color="blue"
            loading={isLoading}
          />

          {/* Card: Agendamentos Pendentes */}
          <MetricCard
            title="Pendentes"
            value={metrics.pendingAppointments}
            icon={<Clock className="h-5 w-5" />}
            color="amber"
            loading={isLoading}
            subtitle={`de ${metrics.totalAppointments}`}
          />

          {/* Card: Agendamentos Confirmados */}
          <MetricCard
            title="Confirmados"
            value={metrics.confirmedAppointments}
            icon={<CheckCircle className="h-5 w-5" />}
            color="green"
            loading={isLoading}
          />

          {/* Card: Mensagens Não Lidas */}
          <MetricCard
            title="Mensagens"
            value={metrics.unreadMessages}
            icon={<MessageCircle className="h-5 w-5" />}
            color="purple"
            badge="novo"
            loading={isLoading}
          />
        </div>

        {/* Section: Próximos Agendamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Próximos Agendamentos</h2>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (appointmentsQuery.data || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum agendamento encontrado
              </p>
            ) : (
              <div className="space-y-3">
                {(appointmentsQuery.data || []).slice(0, 5).map((apt) => (
                  <AppointmentRow key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </Card>

          {/* Sidebar: Estatísticas Rápidas */}
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Taxa de Confirmação</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {metrics.totalAppointments > 0
                      ? Math.round(
                          (metrics.confirmedAppointments / metrics.totalAppointments) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Mensagens Pendentes</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{metrics.unreadMessages}</p>
                  <p className="text-xs text-purple-600 mt-1">de {metrics.totalMessages} total</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Ação Necessária</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {metrics.pendingAppointments + metrics.unreadMessages}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">agendamentos + mensagens</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Section: Gráfico de Tendência Semanal */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Tendência de Agendamentos (Semana)</h2>
          {isLoading ? (
            <div className="h-64 bg-muted rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: "0.875rem" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "0.875rem" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Agendamentos"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Section: Ações Rápidas */}
        <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Novo Agendamento</Button>
            <Button variant="outline">Bloquear Datas</Button>
            <Button variant="outline">Ver Mensagens</Button>
            <Button variant="outline">Configurações</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

/**
 * Componente: Card de Métrica
 */
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "green" | "purple";
  loading?: boolean;
  badge?: string;
  subtitle?: string;
}

function MetricCard({
  title,
  value,
  icon,
  color,
  loading,
  badge,
  subtitle,
}: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
  };

  const iconColorClasses: Record<string, string> = {
    blue: "text-blue-600",
    amber: "text-amber-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <Card className={`p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          {loading ? (
            <div className="h-8 bg-current opacity-20 rounded mt-2 w-12 animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold mt-1">{value}</p>
              {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
        <div className={`${iconColorClasses[color]} opacity-60`}>{icon}</div>
      </div>
      {badge && (
        <Badge variant="secondary" className="mt-3 capitalize">
          {badge}
        </Badge>
      )}
    </Card>
  );
}

/**
 * Componente: Linha de Agendamento
 */
interface AppointmentRowProps {
  appointment: any;
}

function AppointmentRow({ appointment }: AppointmentRowProps) {
  const statusColor: Record<string, string> = {
    pendente: "bg-amber-100 text-amber-800",
    confirmado: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
    concluido: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-current border-opacity-10 hover:bg-current hover:bg-opacity-5 transition">
      <div className="flex-1">
        <p className="font-medium text-sm">{appointment.clientName}</p>
        <p className="text-xs opacity-60">
          {new Date(appointment.appointmentDate).toLocaleDateString("pt-BR")} às{" "}
          {appointment.appointmentTime}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={statusColor[appointment.status] || "bg-gray-100 text-gray-800"}>
          {appointment.status}
        </Badge>
        <Button variant="ghost" size="sm">
          Ver
        </Button>
      </div>
    </div>
  );
}

/**
 * Função auxiliar: Gerar dados de tendência semanal
 */
function generateWeeklyTrendData(appointments: any[]) {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  const today = new Date();

  return days.map((day, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));

    const dayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return (
        aptDate.toLocaleDateString("pt-BR") === date.toLocaleDateString("pt-BR")
      );
    });

    return {
      day,
      count: dayAppointments.length,
      date: date.toLocaleDateString("pt-BR"),
    };
  });
}

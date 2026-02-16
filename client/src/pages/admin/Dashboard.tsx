import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MessageCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  CalendarDays,
  MessageSquare,
  Settings,
  Plus,
  Eye,
  Filter,
  PieChart as PieChartIcon,
  BarChart
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  // Fetch appointments (próximos agendamentos)
  const appointmentsQuery = trpc.booking.list.useQuery({});

  // Fetch messages (mensagens não lidas)
  const messagesQuery = trpc.contact.getMessages.useQuery({
    status: "novo",
  });

  // Get unread count
  const unreadCountQuery = trpc.contact.getUnreadCount.useQuery();

  // Fetch posts for blog metrics
  const postsQuery = trpc.blog.getPosts.useQuery({ limit: 100 });

  // Calcular métricas avançadas
  const metrics = useMemo(() => {
    const appointments = appointmentsQuery.data || [];
    const messages = messagesQuery.data || [];
    const posts = postsQuery.data || [];

    // Filtrar por período selecionado
    const now = new Date();
    const periodStart = new Date();
    switch (selectedPeriod) {
      case "7d":
        periodStart.setDate(now.getDate() - 7);
        break;
      case "30d":
        periodStart.setDate(now.getDate() - 30);
        break;
      case "90d":
        periodStart.setDate(now.getDate() - 90);
        break;
      default:
        periodStart.setDate(now.getDate() - 7);
    }

    const periodAppointments = appointments.filter(apt =>
      new Date(apt.appointmentDate) >= periodStart
    );

    const pendingCount = periodAppointments.filter((a) => a.status === "pendente").length;
    const confirmedCount = periodAppointments.filter((a) => a.status === "confirmado").length;
    const completedCount = periodAppointments.filter((a) => a.status === "concluido").length;
    const cancelledCount = periodAppointments.filter((a) => a.status === "cancelado").length;

    // Métricas de receita (estimativa baseada em sessões)
    const estimatedRevenue = completedCount * 150; // R$ 150 por sessão

    // Métricas de blog
    const postsArray = Array.isArray(posts) ? posts : posts?.posts || [];
    const publishedPosts = postsArray.filter((post: any) => post.published).length;
    const draftPosts = postsArray.filter((post: any) => !post.published).length;

    return {
      // Agendamentos
      totalAppointments: periodAppointments.length,
      pendingAppointments: pendingCount,
      confirmedAppointments: confirmedCount,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledCount,

      // Mensagens
      unreadMessages: unreadCountQuery.data?.count || 0,
      totalMessages: messages.length,

      // Receita
      estimatedRevenue,

      // Blog
      publishedPosts,
      draftPosts,
      totalPosts: postsArray.length,

      // Taxas
      confirmationRate: periodAppointments.length > 0
        ? Math.round((confirmedCount / periodAppointments.length) * 100)
        : 0,
      completionRate: periodAppointments.length > 0
        ? Math.round((completedCount / periodAppointments.length) * 100)
        : 0,
      cancellationRate: periodAppointments.length > 0
        ? Math.round((cancelledCount / periodAppointments.length) * 100)
        : 0,

      // Dados para gráficos
      weeklyTrend: generateWeeklyTrendData(appointments),
      statusDistribution: [
        { name: "Confirmados", value: confirmedCount, color: "#10b981" },
        { name: "Pendentes", value: pendingCount, color: "#f59e0b" },
        { name: "Concluídos", value: completedCount, color: "#3b82f6" },
        { name: "Cancelados", value: cancelledCount, color: "#ef4444" },
      ].filter(item => item.value > 0),
    };
  }, [appointmentsQuery.data, messagesQuery.data, unreadCountQuery.data, postsQuery.data, selectedPeriod]);

  const isLoading =
    appointmentsQuery.isLoading ||
    messagesQuery.isLoading ||
    unreadCountQuery.isLoading ||
    postsQuery.isLoading;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-8">
        {/* Breadcrumb e Header */}
        <div className="admin-section-light rounded-lg p-6">
          <AdminBreadcrumb className="mb-2" />

          {/* Header com controles */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold title-accent-bg-solid">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo! Aqui você visualiza o resumo completo de agendamentos, mensagens e atividades.
              </p>
            </div>

            {/* Controles de período */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="admin-section-dark rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card: Total de Agendamentos */}
            <MetricCard
              title="Agendamentos"
              value={metrics.totalAppointments}
              icon={<Calendar className="h-5 w-5" />}
              color="blue"
              loading={isLoading}
              subtitle={`${selectedPeriod}`}
              trend={metrics.totalAppointments > 0 ? "+12%" : undefined}
            />

            {/* Card: Receita Estimada */}
            <MetricCard
              title="Receita Estimada"
              value={metrics.estimatedRevenue}
              icon={<DollarSign className="h-5 w-5" />}
              color="green"
              loading={isLoading}
              subtitle="R$"
              format="currency"
              trend="+8%"
            />

            {/* Card: Taxa de Confirmação */}
            <MetricCard
              title="Taxa Confirmação"
              value={metrics.confirmationRate}
              icon={<CheckCircle className="h-5 w-5" />}
              color="emerald"
              loading={isLoading}
              subtitle="%"
              trend={metrics.confirmationRate > 70 ? "bom" : "atenção"}
            />

            {/* Card: Mensagens Não Lidas */}
            <MetricCard
              title="Mensagens"
              value={metrics.unreadMessages}
              icon={<MessageCircle className="h-5 w-5" />}
              color="purple"
              loading={isLoading}
              badge="novo"
              trend={metrics.unreadMessages > 5 ? "atenção" : undefined}
            />
          </div>
        </div>

        {/* Cards de Métricas Secundárias */}
        <div className="admin-section-light rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card: Agendamentos Pendentes */}
            <MetricCard
              title="Pendentes"
              value={metrics.pendingAppointments}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              loading={isLoading}
              subtitle={`de ${metrics.totalAppointments}`}
            />

            {/* Card: Agendamentos Concluídos */}
            <MetricCard
              title="Concluídos"
              value={metrics.completedAppointments}
              icon={<CheckCircle className="h-5 w-5" />}
              color="blue"
              loading={isLoading}
            />

            {/* Card: Posts Publicados */}
            <MetricCard
              title="Posts Blog"
              value={metrics.publishedPosts}
              icon={<BarChart3 className="h-5 w-5" />}
              color="indigo"
              loading={isLoading}
              subtitle={`de ${metrics.totalPosts} total`}
            />

            {/* Card: Ações Necessárias */}
            <MetricCard
              title="Ação Necessária"
              value={metrics.pendingAppointments + metrics.unreadMessages}
              icon={<AlertCircle className="h-5 w-5" />}
              color="red"
              loading={isLoading}
              subtitle="agendamentos + mensagens"
            />
          </div>
        </div>

        {/* Seção de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Tendência Semanal */}
          <div className="admin-section-dark rounded-lg p-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Tendência de Agendamentos</h2>
                <Badge variant="outline" className="text-xs">
                  {selectedPeriod}
                </Badge>
              </div>
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
          </div>

          {/* Distribuição por Status */}
          <div className="admin-section-light rounded-lg p-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Status dos Agendamentos</h2>
                <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              {isLoading ? (
                <div className="h-64 bg-muted rounded animate-pulse" />
              ) : metrics.statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metrics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {metrics.statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Seção: Próximos Agendamentos e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximos Agendamentos */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Próximos Agendamentos</h2>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
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
                {(appointmentsQuery.data || [])
                  .filter(apt => new Date(apt.appointmentDate) >= new Date())
                  .slice(0, 5)
                  .map((apt) => (
                    <AppointmentRow key={apt.id} appointment={apt} />
                  ))}
              </div>
            )}
          </Card>

          {/* Sidebar: Estatísticas e Ações */}
          <div className="space-y-4">
            {/* Taxa de Confirmação */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Taxa de Confirmação</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {metrics.confirmationRate}%
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {metrics.confirmedAppointments} de {metrics.totalAppointments}
                  </p>
                </div>
              </div>
            </Card>

            {/* Mensagens Pendentes */}
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

            {/* Ações Necessárias */}
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

        {/* Ações Rápidas */}
        <div className="admin-section-light rounded-lg p-6">
          <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Bloquear Datas
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ver Mensagens
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            </div>
          </Card>
        </div>
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
  color: "blue" | "amber" | "green" | "purple" | "red" | "emerald" | "indigo";
  loading?: boolean;
  badge?: string;
  subtitle?: string;
  format?: "currency" | "number";
  trend?: string;
}

function MetricCard({
  title,
  value,
  icon,
  color,
  loading,
  badge,
  subtitle,
  format,
  trend,
}: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "bg-primary/10 border-primary/20 text-primary",
    amber: "bg-accent/10 border-accent/20 text-accent-foreground",
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    red: "bg-red-50 border-red-200 text-red-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900",
  };

  const iconColorClasses: Record<string, string> = {
    blue: "text-primary",
    amber: "text-accent",
    green: "text-green-600",
    purple: "text-purple-600",
    red: "text-red-600",
    emerald: "text-emerald-600",
    indigo: "text-indigo-600",
  };

  const formatValue = (val: number, fmt?: string) => {
    if (fmt === "currency") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(val);
    }
    return val.toLocaleString("pt-BR");
  };

  return (
    <Card className={`p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-75">{title}</p>
            {trend && (
              <Badge
                variant={trend.includes("atenção") ? "destructive" : "secondary"}
                className="text-xs"
              >
                {trend}
              </Badge>
            )}
          </div>
          {loading ? (
            <div className="h-8 bg-current opacity-20 rounded mt-2 w-16 animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold mt-1">{formatValue(value, format)}</p>
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
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
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
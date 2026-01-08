import { useState, useMemo } from "react";
import { Mail, MessageSquare, MailOpen, Reply, Trash2, Archive, Search, Filter, Clock, Phone, User, ChevronLeft, MoreVertical, Check, X, RefreshCw, BarChart3, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type MessageStatus = "novo" | "lido" | "respondido" | "arquivado";

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  repliedAt?: string;
}

const statusConfig: Record<MessageStatus, { label: string; color: string; bgColor: string; icon: typeof Mail }> = {
  novo: { label: "Nova", color: "text-blue-700", bgColor: "bg-blue-100", icon: Mail },
  lido: { label: "Lida", color: "text-gray-700", bgColor: "bg-gray-100", icon: MailOpen },
  respondido: { label: "Respondida", color: "text-green-700", bgColor: "bg-green-100", icon: Reply },
  arquivado: { label: "Arquivada", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: Archive },
};

const emailTypeLabels: Record<string, string> = {
  appointmentConfirmation: "Confirmação de Agendamento",
  appointmentReminder: "Lembrete de Consulta",
  newContactNotification: "Novo Contato",
  contactAutoReply: "Auto-resposta de Contato",
  passwordReset: "Reset de Senha",
  custom: "Customizado",
};

export default function Communication() {
  const [activeTab, setActiveTab] = useState("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<MessageStatus | "all">("all");
  const [emailTypeFilter, setEmailTypeFilter] = useState<string>("all");
  const [emailStatusFilter, setEmailStatusFilter] = useState<"all" | "sent" | "failed">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // === MENSAGENS ===
  const messagesQuery = trpc.contact.getMessages.useQuery({});
  const unreadCountQuery = trpc.contact.getUnreadCount.useQuery();
  const unreadCount = unreadCountQuery.data?.count ?? 0;
  const apiMessages = messagesQuery.data || [];

  const deleteMutation = trpc.contact.deleteMessage.useMutation({
    onSuccess: () => {
      toast.success("Mensagem deletada!");
      setDeleteConfirmId(null);
      messagesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar mensagem");
    },
  });

  const markRepliedMutation = trpc.contact.markReplied.useMutation({
    onSuccess: () => {
      toast.success("Mensagem marcada como respondida!");
      setIsDetailOpen(false);
      messagesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao marcar como respondida");
    },
  });

  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      messagesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const messages: Message[] = apiMessages.length > 0 
    ? apiMessages.map(m => ({
        id: String(m.id),
        name: m.name,
        email: m.email,
        phone: m.phone || undefined,
        subject: m.subject,
        content: m.content,
        status: m.status as MessageStatus,
        createdAt: m.createdAt.toISOString(),
      }))
    : [];

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (selectedStatus !== "all" && msg.status !== selectedStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          msg.name.toLowerCase().includes(query) ||
          msg.email.toLowerCase().includes(query) ||
          msg.subject.toLowerCase().includes(query) ||
          msg.content.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [messages, selectedStatus, searchQuery]);

  const messageStats = useMemo(() => ({
    total: messages.length,
    novo: messages.filter((m) => m.status === "novo").length,
    lido: messages.filter((m) => m.status === "lido").length,
    respondido: messages.filter((m) => m.status === "respondido").length,
    arquivado: messages.filter((m) => m.status === "arquivado").length,
  }), [messages]);

  // === EMAILS ===
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = trpc.email.getLogs.useQuery({
    emailType: emailTypeFilter !== "all" ? emailTypeFilter : undefined,
    status: emailStatusFilter !== "all" ? emailStatusFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 100,
  });

  const { data: stats } = trpc.email.getStats.useQuery();

  // === HANDLERS ===
  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);
    // Marcar como lida automaticamente ao abrir
    if (message.status === "novo") {
      updateStatusMutation.mutate({ id: Number(message.id), status: "lido" });
    }
  };

  const handleUpdateStatus = (id: string, status: MessageStatus) => {
    updateStatusMutation.mutate({ id: Number(id), status });
  };

  const handleReply = (message: Message) => {
    const subject = encodeURIComponent(`Re: ${message.subject}`);
    const body = encodeURIComponent(`\n\n---\nEm resposta à sua mensagem:\n"${message.content}"`);
    window.location.href = `mailto:${message.email}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      markRepliedMutation.mutate({ id: Number(message.id) });
    }, 500);
  };

  const handleMarkAsReplied = (id: string) => {
    markRepliedMutation.mutate({ id: Number(id) });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id: Number(id) });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Agora há pouco";
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString("pt-BR");
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunicação</h1>
          <p className="text-gray-600 mt-2">
            Gerencie mensagens de contato e histórico de emails
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare size={16} />
              <span>Mensagens</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail size={16} />
              <span>Histórico de Emails</span>
            </TabsTrigger>
          </TabsList>

          {/* === TAB: MENSAGENS === */}
          <TabsContent value="messages" className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="p-4 border-l-4 border-l-gray-400">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-gray-900">{messageStats.total}</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="text-sm text-gray-600">Novas</div>
                <div className="text-2xl font-bold text-blue-600">{messageStats.novo}</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-gray-300">
                <div className="text-sm text-gray-600">Lidas</div>
                <div className="text-2xl font-bold text-gray-600">{messageStats.lido}</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-green-500">
                <div className="text-sm text-gray-600">Respondidas</div>
                <div className="text-2xl font-bold text-green-600">{messageStats.respondido}</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-yellow-500">
                <div className="text-sm text-gray-600">Arquivadas</div>
                <div className="text-2xl font-bold text-yellow-600">{messageStats.arquivado}</div>
              </Card>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar mensagens..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as MessageStatus | "all")}
                  className="px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="all">Todos os Status</option>
                  <option value="novo">Novas</option>
                  <option value="lido">Lidas</option>
                  <option value="respondido">Respondidas</option>
                  <option value="arquivado">Arquivadas</option>
                </select>
              </div>
            </div>

            {/* Lista de Mensagens */}
            <Card className="overflow-hidden">
              <div className="divide-y">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        message.status === "novo" ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => handleViewMessage(message)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.status === "novo" ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                          {message.status === "novo" ? (
                            <Mail size={18} className="text-blue-600" />
                          ) : (
                            <MailOpen size={18} className="text-gray-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold ${message.status === "novo" ? "text-gray-900" : "text-gray-700"}`}>
                              {message.name}
                            </span>
                            <Badge className={statusConfig[message.status].bgColor}>
                              <span className={statusConfig[message.status].color}>
                                {statusConfig[message.status].label}
                              </span>
                            </Badge>
                          </div>
                          <div className={`text-sm mb-1 ${message.status === "novo" ? "font-medium text-gray-900" : "text-gray-700"}`}>
                            {message.subject}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {message.content}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(message.createdAt)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReply(message); }}>
                                <Reply size={14} className="mr-2" />
                                Responder
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsReplied(message.id); }}>
                                <Check size={14} className="mr-2" />
                                Marcar como Respondida
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(message.id, "novo"); }}>
                                <Mail size={14} className="mr-2" />
                                Marcar como Nova
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(message.id, "lido"); }}>
                                <MailOpen size={14} className="mr-2" />
                                Marcar como Lida
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(message.id, "arquivado"); }}>
                                <Archive size={14} className="mr-2" />
                                Arquivar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(message.id); }}
                                className="text-red-600"
                              >
                                <Trash2 size={14} className="mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhuma mensagem encontrada</p>
                    <p className="text-sm mt-1">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* === TAB: EMAILS === */}
          <TabsContent value="emails" className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                    <h3 className="text-sm font-medium">Total de Emails</h3>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="px-6 pb-4">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Todos os emails</p>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                    <h3 className="text-sm font-medium">Enviados</h3>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="px-6 pb-4">
                    <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}% de sucesso
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                    <h3 className="text-sm font-medium">Falhados</h3>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="px-6 pb-4">
                    <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% de falha
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                    <h3 className="text-sm font-medium">Tipos</h3>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="px-6 pb-4">
                    <div className="text-2xl font-bold">{Object.keys(stats.byType).length}</div>
                    <p className="text-xs text-muted-foreground">Templates diferentes</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </h3>
              </div>
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailType">Tipo de Email</Label>
                    <Select value={emailTypeFilter} onValueChange={setEmailTypeFilter}>
                      <SelectTrigger id="emailType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        {Object.entries(emailTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailStatus">Status</Label>
                    <Select value={emailStatusFilter} onValueChange={(v) => setEmailStatusFilter(v as any)}>
                      <SelectTrigger id="emailStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="sent">Enviados</SelectItem>
                        <SelectItem value="failed">Falhados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDateEmail">Data Inicial</Label>
                    <Input
                      id="startDateEmail"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDateEmail">Data Final</Label>
                    <Input
                      id="endDateEmail"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => refetchLogs()} size="sm">
                    Aplicar Filtros
                  </Button>
                  <Button 
                    onClick={() => {
                      setEmailTypeFilter("all");
                      setEmailStatusFilter("all");
                      setStartDate("");
                      setEndDate("");
                      refetchLogs();
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </Card>

            {/* Email Logs Table */}
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Logs de Emails</h3>
                <p className="text-sm text-muted-foreground">
                  Mostrando {logs?.length || 0} emails (últimos 100)
                </p>
              </div>
              <div className="p-6">
                {logsLoading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : !logs || logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum email encontrado com os filtros selecionados
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Destinatário</TableHead>
                          <TableHead>Assunto</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm">
                                {format(new Date(log.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                <span className="text-gray-500">{format(new Date(log.createdAt), "HH:mm", { locale: ptBR })}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{log.recipientEmail}</TableCell>
                            <TableCell className="max-w-xs truncate" title={log.subject}>
                              {log.subject}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {emailTypeLabels[log.emailType] || log.emailType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.status === "sent" ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Enviado
                                </Badge>
                              ) : (
                                <Badge variant="default" className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Falha
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Visualização Detalhada de Mensagem */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsDetailOpen(false)}
                      className="mr-2"
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    <DialogTitle className="flex-1">{selectedMessage.subject}</DialogTitle>
                    <Badge className={statusConfig[selectedMessage.status].bgColor}>
                      <span className={statusConfig[selectedMessage.status].color}>
                        {statusConfig[selectedMessage.status].label}
                      </span>
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Informações do Remetente */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{selectedMessage.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Mail size={14} />
                        <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                          {selectedMessage.email}
                        </a>
                      </div>
                      {selectedMessage.phone && (
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Phone size={14} />
                          <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                            {selectedMessage.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatFullDate(selectedMessage.createdAt)}
                    </div>
                  </div>

                  {/* Conteúdo da Mensagem */}
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedMessage.content}
                    </p>
                  </div>

                  {/* Info de Resposta */}
                  {selectedMessage.repliedAt && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      <Check size={16} />
                      <span>Respondida em {formatFullDate(selectedMessage.repliedAt)}</span>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmId(selectedMessage.id)}
                    className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                  <Button
                    onClick={() => handleReply(selectedMessage)}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Reply size={16} />
                    Responder por Email
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

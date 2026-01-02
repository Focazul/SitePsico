import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function CalendarSettings() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [calendarId, setCalendarId] = useState('primary');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: config, refetch: refetchConfig, isLoading } = trpc.calendar.getConfig.useQuery();
  const { data: statusData } = trpc.calendar.isEnabled.useQuery();
  const saveConfigMutation = trpc.calendar.saveConfig.useMutation();
  const startOAuthMutation = trpc.calendar.startOAuth.useMutation();
  const revokeAccessMutation = trpc.calendar.revokeAccess.useMutation();
  const testConnectionMutation = trpc.calendar.testConnection.useMutation();
  const { data: upcomingEvents, refetch: refetchEvents } = trpc.calendar.getUpcoming.useQuery({ maxResults: 10 });

  // Carregar config ao montar
  useEffect(() => {
    if (config) {
      setClientId(config.clientId || '');
      setEnabled(config.enabled || false);
      setCalendarId(config.calendarId || 'primary');
    }
  }, [config]);

  // Processar callback OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      handleOAuthCallback(code);
      // Limpar URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      setIsSaving(true);
      const callbackMutation = trpc.calendar.handleCallback.useMutation();
      await callbackMutation.mutateAsync({ code });
      
      setSaveMessage({ type: 'success', message: 'Autorização concluída com sucesso!' });
      await refetchConfig();
    } catch (error: any) {
      setSaveMessage({ type: 'error', message: error.message || 'Erro ao processar autorização' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      if (!clientId.trim()) {
        setSaveMessage({ type: 'error', message: 'Client ID é obrigatório' });
        return;
      }

      if (!clientSecret.trim()) {
        setSaveMessage({ type: 'error', message: 'Client Secret é obrigatório' });
        return;
      }

      await saveConfigMutation.mutateAsync({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        enabled,
        calendarId: calendarId.trim() || 'primary'
      });

      setSaveMessage({ type: 'success', message: 'Configurações salvas com sucesso!' });
      await refetchConfig();
    } catch (error: any) {
      setSaveMessage({ type: 'error', message: error.message || 'Erro ao salvar configurações' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartOAuth = async () => {
    try {
      setIsSaving(true);
      const result = await startOAuthMutation.mutateAsync();
      
      if (result.authUrl) {
        // Redirecionar para autorização
        window.location.href = result.authUrl;
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', message: error.message || 'Erro ao iniciar autorização' });
      setIsSaving(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!confirm('Tem certeza que deseja revogar o acesso ao Google Calendar?')) {
      return;
    }

    try {
      setIsSaving(true);
      await revokeAccessMutation.mutateAsync();
      setSaveMessage({ type: 'success', message: 'Acesso revogado com sucesso' });
      await refetchConfig();
    } catch (error: any) {
      setSaveMessage({ type: 'error', message: error.message || 'Erro ao revogar acesso' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      const result = await testConnectionMutation.mutateAsync();
      setSaveMessage({ type: 'success', message: result.message });
    } catch (error: any) {
      setSaveMessage({ type: 'error', message: error.message || 'Erro ao testar conexão' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isConfigured = config?.hasRefreshToken;
  const isActive = statusData?.enabled;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Google Calendar</h1>
        <p className="text-gray-600 mt-2">
          Integre seus agendamentos com o Google Calendar para sincronização automática
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Status da Integração
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isActive ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inativo
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isConfigured ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Configurado</AlertTitle>
                <AlertDescription className="text-green-700">
                  Google Calendar conectado e pronto para uso
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Configuração Pendente</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Configure as credenciais e autorize o acesso para ativar a integração
                </AlertDescription>
              </Alert>
            )}

            {saveMessage && (
              <Alert className={saveMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                {saveMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={saveMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {saveMessage.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="help">Ajuda</TabsTrigger>
        </TabsList>

        {/* Tab: Configuração */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credenciais do Google</CardTitle>
              <CardDescription>
                Configure as credenciais do Google Cloud Console para habilitar a integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="GOCSPX-..."
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendarId">Calendar ID (opcional)</Label>
                <Input
                  id="calendarId"
                  value={calendarId}
                  onChange={(e) => setCalendarId(e.target.value)}
                  placeholder="primary"
                  disabled={isSaving}
                />
                <p className="text-sm text-gray-500">
                  Use "primary" para seu calendário principal ou o ID específico de outro calendário
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t">
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                  disabled={isSaving}
                />
                <Label htmlFor="enabled" className="cursor-pointer">
                  Habilitar integração com Google Calendar
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveConfig} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Configurações
                </Button>

                {isConfigured && (
                  <Button variant="outline" onClick={handleTestConnection} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Testar Conexão
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Autorização OAuth */}
          <Card>
            <CardHeader>
              <CardTitle>Autorização</CardTitle>
              <CardDescription>
                Autorize o aplicativo a acessar seu Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConfigured ? (
                <>
                  <p className="text-sm text-gray-600">
                    Após salvar as credenciais acima, clique no botão abaixo para autorizar o acesso ao seu Google Calendar.
                  </p>
                  <Button onClick={handleStartOAuth} disabled={isSaving || !clientId || !clientSecret}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Autorizar com Google
                  </Button>
                </>
              ) : (
                <>
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Autorizado</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Aplicativo autorizado a acessar seu Google Calendar
                    </AlertDescription>
                  </Alert>
                  <Button variant="destructive" onClick={handleRevokeAccess} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Revogar Acesso
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Eventos */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Próximos Eventos</CardTitle>
                  <CardDescription>
                    Visualize os próximos eventos do seu calendário
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchEvents()}
                  disabled={!isConfigured}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isConfigured ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configure e autorize a integração para visualizar eventos
                  </AlertDescription>
                </Alert>
              ) : upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{event.summary || 'Sem título'}</div>
                      {event.start?.dateTime && (
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(event.start.dateTime).toLocaleString('pt-BR')}
                        </div>
                      )}
                      {event.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum evento próximo encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Ajuda */}
        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como Configurar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Criar Projeto no Google Cloud</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Acesse <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                  <li>Crie um novo projeto ou selecione um existente</li>
                  <li>Vá em "APIs & Services" → "Library"</li>
                  <li>Busque e habilite "Google Calendar API"</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Configurar OAuth Consent Screen</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Vá em "APIs & Services" → "OAuth consent screen"</li>
                  <li>Escolha "External" e clique em "Create"</li>
                  <li>Preencha os campos obrigatórios (nome do app, email)</li>
                  <li>Adicione os escopos: calendar e calendar.events</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Criar Credenciais OAuth</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Vá em "APIs & Services" → "Credentials"</li>
                  <li>Clique em "Create Credentials" → "OAuth client ID"</li>
                  <li>Escolha "Web application"</li>
                  <li>Adicione redirect URI: <code className="bg-gray-100 px-1 rounded">http://localhost:5173/admin/calendar</code></li>
                  <li>Copie o Client ID e Client Secret</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Configurar no Sistema</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Cole o Client ID e Client Secret nos campos acima</li>
                  <li>Marque "Habilitar integração"</li>
                  <li>Clique em "Salvar Configurações"</li>
                  <li>Clique em "Autorizar com Google"</li>
                  <li>Faça login e conceda as permissões</li>
                </ol>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Guarde o Client Secret em local seguro e nunca o compartilhe publicamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

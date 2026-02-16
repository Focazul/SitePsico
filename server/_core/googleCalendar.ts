import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../db';
import { settings } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Interface para configuração do Google Calendar
interface CalendarConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
  calendarId?: string; // ID do calendário (primary ou específico)
}

// Cache de configuração (5 minutos)
let configCache: { data: CalendarConfig | null; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém configurações do Google Calendar do banco de dados
 */
async function getCalendarConfig(): Promise<CalendarConfig> {
  // Verificar cache
  if (configCache && Date.now() - configCache.timestamp < CACHE_TTL) {
    if (configCache.data) return configCache.data;
  }

  const db = (await getDb())!;
  const configSettings = await db.select().from(settings).where(
    eq(settings.key, 'googleCalendar')
  );

  const config: CalendarConfig = {
    enabled: false,
    clientId: '',
    clientSecret: '',
    redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:5173/admin/settings/calendar/callback',
    calendarId: 'primary'
  };

  // Parse das configurações individuais
  for (const setting of configSettings) {
    const key = setting.key.replace('googleCalendar.', '');
    const value = setting.value;

    switch (key) {
      case 'enabled':
        config.enabled = value === 'true';
        break;
      case 'clientId':
        config.clientId = value;
        break;
      case 'clientSecret':
        config.clientSecret = value;
        break;
      case 'refreshToken':
        config.refreshToken = value;
        break;
      case 'calendarId':
        config.calendarId = value || 'primary';
        break;
    }
  }

  // Atualizar cache
  configCache = {
    data: config,
    timestamp: Date.now()
  };

  return config;
}

/**
 * Limpa o cache de configuração
 */
export function clearCalendarConfigCache(): void {
  configCache = null;
}

/**
 * Cria cliente OAuth2 do Google
 */
async function getOAuth2Client(): Promise<OAuth2Client> {
  const config = await getCalendarConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error('Google Calendar não configurado. Configure Client ID e Client Secret.');
  }

  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  if (config.refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: config.refreshToken
    });
  }

  return oauth2Client;
}

/**
 * Gera URL de autorização OAuth2
 */
export async function getAuthUrl(): Promise<string> {
  const oauth2Client = await getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    prompt: 'consent' // Força exibição de consent screen para obter refresh token
  });

  return authUrl;
}

/**
 * Processa código de autorização e salva refresh token
 */
export async function handleOAuthCallback(code: string): Promise<void> {
  const oauth2Client = await getOAuth2Client();

  // Troca código por tokens
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error('Refresh token não recebido. Tente novamente.');
  }

  // Salvar refresh token no banco
  const db = (await getDb())!;
  await db
    .insert(settings)
    .values({
      key: 'googleCalendar.refreshToken',
      value: tokens.refresh_token,
      type: 'string',
      description: 'Google Calendar Refresh Token'
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: tokens.refresh_token }
    });

  // Limpar cache
  clearCalendarConfigCache();
}

/**
 * Verifica se o Google Calendar está configurado e ativo
 */
export async function isCalendarEnabled(): Promise<boolean> {
  const config = await getCalendarConfig();
  return config.enabled && !!config.refreshToken;
}

/**
 * Cria evento no Google Calendar
 */
export async function createCalendarEvent(data: {
  patientName: string;
  patientEmail: string;
  date: Date;
  duration: number; // em minutos
  type: 'presencial' | 'online';
  meetingLink?: string;
  notes?: string;
}): Promise<string | null> {
  try {
    const enabled = await isCalendarEnabled();
    if (!enabled) {
      console.log('[Google Calendar] Integração desabilitada, pulando criação de evento');
      return null;
    }

    const oauth2Client = await getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const config = await getCalendarConfig();

    const endDate = new Date(data.date);
    endDate.setMinutes(endDate.getMinutes() + data.duration);

    const eventData: calendar_v3.Schema$Event = {
      summary: `Consulta - ${data.patientName}`,
      description: [
        `Tipo: ${data.type === 'online' ? 'Online' : 'Presencial'}`,
        data.meetingLink ? `Link: ${data.meetingLink}` : '',
        data.notes ? `\nNotas: ${data.notes}` : ''
      ].filter(Boolean).join('\n'),
      start: {
        dateTime: data.date.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      attendees: [
        {
          email: data.patientEmail,
          displayName: data.patientName
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 horas antes
          { method: 'popup', minutes: 30 } // 30 minutos antes
        ]
      },
      colorId: '5' // Amarelo para consultas
    };

    // Adicionar meeting link se online
    if (data.type === 'online' && data.meetingLink) {
      eventData.location = data.meetingLink;
      eventData.conferenceData = {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`
        }
      };
    }

    const response = await calendar.events.insert({
      calendarId: config.calendarId || 'primary',
      requestBody: eventData,
      sendUpdates: 'all' // Envia convite para participantes
    });

    console.log(`[Google Calendar] Evento criado: ${response.data.id}`);
    return response.data.id || null;

  } catch (error) {
    console.error('[Google Calendar] Erro ao criar evento:', error);
    return null;
  }
}

/**
 * Atualiza evento existente no Google Calendar
 */
export async function updateCalendarEvent(
  eventId: string,
  data: {
    patientName?: string;
    patientEmail?: string;
    date?: Date;
    duration?: number;
    type?: 'presencial' | 'online';
    meetingLink?: string;
    notes?: string;
  }
): Promise<boolean> {
  try {
    const enabled = await isCalendarEnabled();
    if (!enabled) {
      console.log('[Google Calendar] Integração desabilitada, pulando atualização');
      return false;
    }

    const oauth2Client = await getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const config = await getCalendarConfig();

    // Buscar evento existente
    const existingEvent = await calendar.events.get({
      calendarId: config.calendarId || 'primary',
      eventId
    });

    if (!existingEvent.data) {
      throw new Error('Evento não encontrado');
    }

    // Preparar dados de atualização
    const updates: calendar_v3.Schema$Event = { ...existingEvent.data };

    if (data.patientName) {
      updates.summary = `Consulta - ${data.patientName}`;
    }

    if (data.date) {
      const endDate = new Date(data.date);
      endDate.setMinutes(endDate.getMinutes() + (data.duration || 50));

      updates.start = {
        dateTime: data.date.toISOString(),
        timeZone: 'America/Sao_Paulo'
      };
      updates.end = {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Sao_Paulo'
      };
    }

    if (data.type || data.notes || data.meetingLink) {
      const descriptionParts: string[] = [];
      
      if (data.type) {
        descriptionParts.push(`Tipo: ${data.type === 'online' ? 'Online' : 'Presencial'}`);
      }
      
      if (data.meetingLink) {
        descriptionParts.push(`Link: ${data.meetingLink}`);
        updates.location = data.meetingLink;
      }
      
      if (data.notes) {
        descriptionParts.push(`\nNotas: ${data.notes}`);
      }

      updates.description = descriptionParts.join('\n');
    }

    if (data.patientEmail && updates.attendees) {
      updates.attendees[0].email = data.patientEmail;
      if (data.patientName) {
        updates.attendees[0].displayName = data.patientName;
      }
    }

    await calendar.events.update({
      calendarId: config.calendarId || 'primary',
      eventId,
      requestBody: updates,
      sendUpdates: 'all' // Notifica participantes
    });

    console.log(`[Google Calendar] Evento atualizado: ${eventId}`);
    return true;

  } catch (error) {
    console.error('[Google Calendar] Erro ao atualizar evento:', error);
    return false;
  }
}

/**
 * Cancela evento no Google Calendar
 */
export async function cancelCalendarEvent(eventId: string): Promise<boolean> {
  try {
    const enabled = await isCalendarEnabled();
    if (!enabled) {
      console.log('[Google Calendar] Integração desabilitada, pulando cancelamento');
      return false;
    }

    const oauth2Client = await getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const config = await getCalendarConfig();

    await calendar.events.delete({
      calendarId: config.calendarId || 'primary',
      eventId,
      sendUpdates: 'all' // Notifica participantes sobre cancelamento
    });

    console.log(`[Google Calendar] Evento cancelado: ${eventId}`);
    return true;

  } catch (error) {
    console.error('[Google Calendar] Erro ao cancelar evento:', error);
    return false;
  }
}

/**
 * Verifica disponibilidade no Google Calendar
 */
export async function checkAvailability(startDate: Date, endDate: Date): Promise<boolean> {
  try {
    const enabled = await isCalendarEnabled();
    if (!enabled) {
      return true; // Se não configurado, assume disponível
    }

    const oauth2Client = await getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const config = await getCalendarConfig();

    const response = await calendar.events.list({
      calendarId: config.calendarId || 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    // Se houver eventos, não está disponível
    return !response.data.items || response.data.items.length === 0;

  } catch (error) {
    console.error('[Google Calendar] Erro ao verificar disponibilidade:', error);
    return true; // Em caso de erro, assume disponível
  }
}

/**
 * Lista próximos eventos do calendário
 */
export async function getUpcomingEvents(maxResults: number = 10): Promise<calendar_v3.Schema$Event[]> {
  try {
    const enabled = await isCalendarEnabled();
    if (!enabled) {
      return [];
    }

    const oauth2Client = await getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const config = await getCalendarConfig();

    const response = await calendar.events.list({
      calendarId: config.calendarId || 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.data.items || [];

  } catch (error) {
    console.error('[Google Calendar] Erro ao listar eventos:', error);
    return [];
  }
}

/**
 * Obtém eventos do Google Calendar para um intervalo de tempo
 */
export async function getEventsForDateRange(startDate: Date, endDate: Date): Promise<calendar_v3.Schema$Event[]> {
  try {
    const enabled = await isCalendarEnabled();
    if (!enabled) {
      return [];
    }

    const oauth2Client = await getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const config = await getCalendarConfig();

    const response = await calendar.events.list({
      calendarId: config.calendarId || 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.data.items || [];

  } catch (error) {
    console.error('[Google Calendar] Erro ao listar eventos por intervalo:', error);
    return [];
  }
}

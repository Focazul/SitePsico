import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../_core/trpc';
import {
  getAuthUrl,
  handleOAuthCallback,
  isCalendarEnabled,
  getUpcomingEvents,
  clearCalendarConfigCache
} from '../_core/googleCalendar';
import { getDb } from '../db';
import { settings } from '../../drizzle/schema';
import { eq, and, like } from 'drizzle-orm';

export const calendarRouter = router({
  /**
   * Verifica se Google Calendar está habilitado
   */
  isEnabled: publicProcedure.query(async () => {
    const enabled = await isCalendarEnabled();
    return { enabled };
  }),

  /**
   * Obtém configurações do Google Calendar (admin)
   */
  getConfig: adminProcedure.query(async () => {
    const db = (await getDb())!;
    const configSettings = await db.select().from(settings).where(
      like(settings.key, 'googleCalendar%')
    );

    const config: Record<string, any> = {
      enabled: false,
      clientId: '',
      hasRefreshToken: false,
      calendarId: 'primary'
    };

    for (const setting of configSettings) {
      const key = setting.key.replace('googleCalendar.', '');
      
      if (key === 'enabled') {
        config.enabled = setting.value === 'true';
      } else if (key === 'clientId') {
        config.clientId = setting.value;
      } else if (key === 'refreshToken') {
        config.hasRefreshToken = !!setting.value;
      } else if (key === 'calendarId') {
        config.calendarId = setting.value || 'primary';
      }
    }

    return config;
  }),

  /**
   * Salva configurações básicas (Client ID, Secret)
   */
  saveConfig: adminProcedure
    .input(z.object({
      clientId: z.string().min(1),
      clientSecret: z.string().min(1),
      enabled: z.boolean(),
      calendarId: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Salvar configurações
      const updates = [
        {
          key: 'googleCalendar.clientId',
          value: input.clientId,
          type: 'string' as const,
          description: 'Google Calendar Client ID'
        },
        {
          key: 'googleCalendar.clientSecret',
          value: input.clientSecret,
          type: 'string' as const,
          description: 'Google Calendar Client Secret'
        },
        {
          key: 'googleCalendar.enabled',
          value: input.enabled.toString(),
          type: 'boolean' as const,
          description: 'Habilitar integração com Google Calendar'
        }
      ];

      if (input.calendarId) {
        updates.push({
          key: 'googleCalendar.calendarId',
          value: input.calendarId,
          type: 'string' as const,
          description: 'ID do calendário do Google'
        });
      }

      for (const update of updates) {
        const db = (await getDb())!;
        await db.insert(settings).values(update).onDuplicateKeyUpdate({
          set: { value: update.value }
        });
      }

      // Limpar cache
      clearCalendarConfigCache();

      return { success: true };
    }),

  /**
   * Ativa/desativa integração
   */
  toggleEnabled: adminProcedure
    .input(z.object({
      enabled: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const db = (await getDb())!;
      await db.insert(settings).values({
        key: 'googleCalendar.enabled',
        value: input.enabled.toString(),
        type: 'boolean',
        description: 'Habilitar integração com Google Calendar'
      }).onDuplicateKeyUpdate({
        set: { value: input.enabled.toString() }
      });

      clearCalendarConfigCache();

      return { success: true, enabled: input.enabled };
    }),

  /**
   * Inicia fluxo OAuth2
   */
  startOAuth: adminProcedure.mutation(async () => {
    try {
      const authUrl = await getAuthUrl();
      return { authUrl };
    } catch (error) {
      throw new Error('Erro ao gerar URL de autorização. Verifique as configurações.');
    }
  }),

  /**
   * Processa callback do OAuth
   */
  handleCallback: adminProcedure
    .input(z.object({
      code: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        await handleOAuthCallback(input.code);
        return { success: true, message: 'Autorização concluída com sucesso!' };
      } catch (error) {
        console.error('[Calendar Router] Erro no OAuth callback:', error);
        throw new Error('Erro ao processar autorização. Tente novamente.');
      }
    }),

  /**
   * Remove autorização
   */
  revokeAccess: adminProcedure.mutation(async () => {
    // Remover refresh token
    const db = (await getDb())!;
    await db.delete(settings).where(
      eq(settings.key, 'googleCalendar.refreshToken')
    );

    clearCalendarConfigCache();

    return { success: true, message: 'Acesso revogado com sucesso' };
  }),

  /**
   * Lista próximos eventos
   */
  getUpcoming: adminProcedure
    .input(z.object({
      maxResults: z.number().default(10)
    }))
    .query(async ({ input }) => {
      try {
        const events = await getUpcomingEvents(input.maxResults);
        return events;
      } catch (error) {
        console.error('[Calendar Router] Erro ao listar eventos:', error);
        return [];
      }
    }),

  /**
   * Testa conexão com Google Calendar
   */
  testConnection: adminProcedure.mutation(async () => {
    try {
      const enabled = await isCalendarEnabled();
      
      if (!enabled) {
        throw new Error('Google Calendar não está configurado ou habilitado');
      }

      // Tentar listar eventos como teste
      const events = await getUpcomingEvents(1);
      
      return { 
        success: true, 
        message: 'Conexão com Google Calendar estabelecida com sucesso!',
        eventsCount: events.length
      };
    } catch (error: any) {
      console.error('[Calendar Router] Erro ao testar conexão:', error);
      throw new Error(`Falha na conexão: ${error.message}`);
    }
  })
});

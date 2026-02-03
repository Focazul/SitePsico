import { z } from "zod";
import {
  addBlockedDate,
  cancelAppointment,
  createAppointment,
  getAllAppointments,
  getAppointmentsByStatus,
  getAppointmentsInRange,
  getAvailableSlots,
} from "../db";
import { adminProcedure, publicProcedure, router, rateLimitedProcedure } from "../_core/trpc";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD");
const timeStr = z.string().regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:mm");
const modality = z.enum(["presencial", "online"]);
const statusEnum = z.enum(["pendente", "confirmado", "cancelado", "concluido"]);

export const bookingRouter = router({
  getAvailableSlots: publicProcedure
    .input(z.object({ date: dateStr }))
    .query(async ({ input }) => {
      const slots = await getAvailableSlots(input.date);
      return { slots };
    }),

  create: rateLimitedProcedure
    .input(z.object({
      clientName: z.string().min(2),
      clientEmail: z.string().email(),
      clientPhone: z.string().min(8),
      appointmentDate: dateStr,
      appointmentTime: timeStr,
      modality,
      subject: z.string().max(500).optional(),
      notes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input }) => {
      const created = await createAppointment({
        ...input,
        appointmentDate: input.appointmentDate,
        appointmentTime: `${input.appointmentTime}:00`,
        status: "pendente",
      });

      // Fire-and-forget notifications and calendar sync; do not block booking response
      import("../_core/notification").then(({ sendAppointmentEmails, scheduleReminderEmail }) => {
        void sendAppointmentEmails(created);
        scheduleReminderEmail(created);
      }).catch((error) => console.warn("[Booking] Failed to trigger notifications", error));

      // Sync com Google Calendar (fire-and-forget)
      Promise.all([
        import("../_core/googleCalendar"),
        import("../db")
      ]).then(([calendarModule, dbModule]) => {
        const { createCalendarEvent } = calendarModule;
        const { updateAppointmentCalendarEventId } = dbModule;
        
        const appointmentDateTime = new Date(`${input.appointmentDate}T${input.appointmentTime}:00`);
        
        createCalendarEvent({
          patientName: created.clientName,
          patientEmail: created.clientEmail,
          date: appointmentDateTime,
          duration: 50, // 50 minutos por padrão
          type: created.modality as 'presencial' | 'online',
          notes: created.notes || undefined
        }).then(async (eventId) => {
          if (eventId) {
            console.log(`[Booking] Google Calendar event created: ${eventId}`);
            // Salvar eventId no banco
            await updateAppointmentCalendarEventId(created.id, eventId);
          }
        }).catch((error) => {
          console.warn("[Booking] Failed to create calendar event", error);
        });
      }).catch((error) => {
        console.warn("[Booking] Failed to import required modules", error);
      });

      return created;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      status: statusEnum,
    }))
    .mutation(async ({ input }) => {
      const { getAppointmentById, updateAppointmentStatus } = await import("../db");
      
      // Buscar agendamento atual
      const appointment = await getAppointmentById(input.id);
      if (!appointment) {
        throw new Error("Agendamento não encontrado");
      }

      // Atualizar status no banco
      await updateAppointmentStatus(input.id, input.status);

      // Se confirmado, enviar email de confirmação (fire-and-forget)
      if (input.status === "confirmado") {
        import("../_core/notification").then(({ sendAppointmentEmails }) => {
          // Reutiliza a lógica de notificação que busca config e formata dados
          void sendAppointmentEmails(appointment).catch(console.error);
        }).catch((error) => {
          console.warn("[Booking] Failed to send confirmation email", error);
        });
      }

      // Se cancelado, cancelar no Google Calendar (fire-and-forget)
      if (input.status === "cancelado" && appointment.calendarEventId) {
        import("../_core/googleCalendar").then(({ cancelCalendarEvent }) => {
          void cancelCalendarEvent(appointment.calendarEventId!).catch(console.error);
        }).catch((error) => {
          console.warn("[Booking] Failed to cancel calendar event", error);
        });
      }

      return { success: true } as const;
    }),

  cancel: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Buscar agendamento para pegar calendarEventId
      const { getAppointmentById } = await import("../db");
      const appointment = await getAppointmentById(input.id);
      
      // Cancelar no banco de dados
      await cancelAppointment(input.id);
      
      // Cancelar no Google Calendar se tiver eventId (fire-and-forget)
      if (appointment?.calendarEventId) {
        import("../_core/googleCalendar").then(({ cancelCalendarEvent }) => {
          cancelCalendarEvent(appointment.calendarEventId!).catch((error) => {
            console.warn("[Booking] Failed to cancel calendar event", error);
          });
        }).catch((error) => {
          console.warn("[Booking] Failed to import googleCalendar module", error);
        });
      }
      
      return { success: true } as const;
    }),

  list: adminProcedure
    .input(z
      .object({
        startDate: dateStr.optional(),
        endDate: dateStr.optional(),
        status: statusEnum.optional(),
      })
      .optional()
    )
    .query(async ({ input }) => {
      if (input?.status) {
        return await getAppointmentsByStatus(input.status);
      }
      const start = input?.startDate ? new Date(`${input.startDate}T00:00:00.000Z`) : undefined;
      const end = input?.endDate ? new Date(`${input.endDate}T23:59:59.999Z`) : undefined;
      return await getAppointmentsInRange(start, end);
    }),

  blockDate: adminProcedure
    .input(z.object({ date: dateStr, reason: z.string().max(255).optional() }))
    .mutation(async ({ input }) => {
      await addBlockedDate({ date: input.date, reason: input.reason });
      return { success: true } as const;
    }),
});

export type BookingRouter = typeof bookingRouter;

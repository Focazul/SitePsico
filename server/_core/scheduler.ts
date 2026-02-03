// Sistema robusto de scheduler para lembretes de consulta
// Usa node-cron e persiste no banco para sobreviver a restarts

import cron from "node-cron";
import { getDb } from "../db";
import { appointments } from "../../drizzle/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { sendAppointmentReminder } from "./email";
import { getPsychologistConfig } from "./psychologistConfig";

interface ScheduledReminder {
  appointmentId: number;
  scheduledFor: Date;
  jobId: string;
}

// Map de lembretes agendados em memória
const scheduledReminders = new Map<number, any>();

/**
 * Agenda um lembrete para uma consulta específica
 * O lembrete é enviado 24h antes da consulta
 */
export async function scheduleAppointmentReminder(appointmentId: number): Promise<boolean> {
  try {
    // Buscar consulta
    const db = (await getDb())!;
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      console.warn(`[Scheduler] Appointment ${appointmentId} not found`);
      return false;
    }

    // Calcular quando enviar o lembrete (24h antes)
    const appointmentDateTime = new Date(
      `${appointment.appointmentDate}T${appointment.appointmentTime}`
    );
    const reminderTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);

    // Se o lembrete já deveria ter sido enviado, não agendar
    if (reminderTime <= new Date()) {
      console.log(`[Scheduler] Reminder for appointment ${appointmentId} is in the past, skipping`);
      return false;
    }

    // Cancelar lembrete anterior se existir
    if (scheduledReminders.has(appointmentId)) {
      scheduledReminders.get(appointmentId)?.stop();
      scheduledReminders.delete(appointmentId);
    }

    // Criar expressão cron para o horário exato
    // Formato: minuto hora dia mês dia-da-semana
    const cronExpression = `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`;

    // Agendar o job
    const task = cron.schedule(
      cronExpression,
      async () => {
        await sendReminderEmail(appointmentId);
        scheduledReminders.delete(appointmentId);
      },
      {
        timezone: "America/Sao_Paulo",
      }
    );

    scheduledReminders.set(appointmentId, task);

    console.log(`[Scheduler] Reminder scheduled for appointment ${appointmentId} at ${reminderTime.toISOString()}`);
    return true;
  } catch (error) {
    console.error(`[Scheduler] Error scheduling reminder for appointment ${appointmentId}:`, error);
    return false;
  }
}

/**
 * Envia o email de lembrete
 */
async function sendReminderEmail(appointmentId: number): Promise<void> {
  try {
    // Buscar consulta atualizada
    const db = (await getDb())!;
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      console.warn(`[Scheduler] Appointment ${appointmentId} not found when sending reminder`);
      return;
    }

    // Não enviar se a consulta foi cancelada
    if (appointment.status === "cancelado") {
      console.log(`[Scheduler] Appointment ${appointmentId} is canceled, skipping reminder`);
      return;
    }

    // Carregar configurações do psicólogo
    const config = await getPsychologistConfig();

    // Formatar data
    const dateVal = appointment.appointmentDate as unknown;
    const dateStr = dateVal instanceof Date
      ? dateVal.toISOString().slice(0, 10)
      : String(dateVal).slice(0, 10);
    const [year, month, day] = dateStr.split("-");
    const displayDate = `${day}/${month}/${year}`;
    const timeStr = String(appointment.appointmentTime).slice(0, 5);

    const modality = appointment.modality as "presencial" | "online";

    // Enviar lembrete
    const success = await sendAppointmentReminder({
      patientEmail: appointment.clientEmail,
      patientName: appointment.clientName,
      appointmentDate: displayDate,
      appointmentTime: timeStr,
      modalidade: modality,
      meetingLink: modality === "online" ? `${config.meeting.linkBase}${appointmentId}` : undefined,
      psychologistName: config.name,
      psychologistPhone: config.phone,
    });

    if (success) {
      console.log(`[Scheduler] Reminder email sent for appointment ${appointmentId}`);
    } else {
      console.warn(`[Scheduler] Failed to send reminder email for appointment ${appointmentId}`);
    }
  } catch (error) {
    console.error(`[Scheduler] Error sending reminder for appointment ${appointmentId}:`, error);
  }
}

/**
 * Cancela um lembrete agendado
 */
export function cancelAppointmentReminder(appointmentId: number): void {
  const task = scheduledReminders.get(appointmentId);
  if (task) {
    task.stop();
    scheduledReminders.delete(appointmentId);
    console.log(`[Scheduler] Reminder cancelled for appointment ${appointmentId}`);
  }
}

/**
 * Inicializa o scheduler carregando consultas futuras do banco
 * Deve ser chamado na inicialização do servidor
 */
export async function initializeScheduler(): Promise<void> {
  console.log("[Scheduler] Initializing appointment reminder scheduler...");

  try {
    // Buscar todas as consultas futuras que não foram canceladas
    const now = new Date();
    const db = (await getDb())!;
    const futureAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(
            sql`CONCAT(${appointments.appointmentDate}, ' ', ${appointments.appointmentTime})`,
            now.toISOString().slice(0, 19).replace("T", " ")
          ),
          sql`${appointments.status} != 'cancelado'`
        )
      );

    console.log(`[Scheduler] Found ${futureAppointments.length} future appointments`);

    // Agendar lembrete para cada consulta
    let scheduled = 0;
    for (const appointment of futureAppointments) {
      const success = await scheduleAppointmentReminder(appointment.id);
      if (success) scheduled++;
    }

    console.log(`[Scheduler] Successfully scheduled ${scheduled} reminders`);
  } catch (error) {
    console.error("[Scheduler] Error initializing scheduler:", error);
  }
}

/**
 * Job que roda diariamente para verificar novos agendamentos
 * Garante que nenhum lembrete seja perdido
 */
export function startDailyReminderCheck(): void {
  // Roda todo dia às 00:05
  cron.schedule(
    "5 0 * * *",
    async () => {
      console.log("[Scheduler] Running daily reminder check...");
      await initializeScheduler();
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  console.log("[Scheduler] Daily reminder check job started (runs at 00:05)");
}

/**
 * Para todos os jobs agendados
 * Útil para shutdown gracioso
 */
export function stopAllReminders(): void {
  console.log(`[Scheduler] Stopping ${scheduledReminders.size} scheduled reminders...`);
  
  for (const [id, task] of scheduledReminders.entries()) {
    task.stop();
  }
  
  scheduledReminders.clear();
  console.log("[Scheduler] All reminders stopped");
}

import { TRPCError } from "@trpc/server";
import { Appointment } from "../../drizzle/schema";
import { sendAppointmentConfirmation, sendAppointmentReminder } from "./email";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const buildEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/")
    ? baseUrl
    : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

/**
 * Dispatches a project-owner notification through the Manus Notification Service.
 * Returns `true` if the request was accepted, `false` when the upstream service
 * cannot be reached (callers can fall back to email/slack). Validation errors
 * bubble up as TRPC errors so callers can fix the payload.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured.",
    });
  }

  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured.",
    });
  }

  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

function formatDateTime(appointment: Appointment): { date: string; time: string; iso: Date } {
  const dateStr = (appointment.appointmentDate as unknown) instanceof Date
    ? (appointment.appointmentDate as unknown as Date).toISOString().slice(0, 10)
    : String(appointment.appointmentDate).slice(0, 10);
  const timeStr = String(appointment.appointmentTime).slice(0, 5);
  const iso = new Date(`${dateStr}T${timeStr}:00.000Z`);
  return { date: dateStr, time: timeStr, iso };
}

export async function sendAppointmentEmails(appointment: Appointment): Promise<{ patient: boolean; owner: boolean; }> {
  // Carregar configurações do psicólogo do banco
  const { getPsychologistConfig } = await import("./psychologistConfig");
  const config = await getPsychologistConfig();
  const { date, time } = formatDateTime(appointment);
  
  // Formatar data para exibição (DD/MM/AAAA)
  const [year, month, day] = date.split("-");
  const displayDate = `${day}/${month}/${year}`;

  // Fix TS2322: 'string' is not assignable to '"presencial" | "online"'.
  // We need to cast appointment.modality to the specific union type.
  const modality = appointment.modality as "presencial" | "online";

  // Enviar email de confirmação profissional ao paciente
  const patientResult = await sendAppointmentConfirmation({
    patientEmail: appointment.clientEmail,
    patientName: appointment.clientName,
    appointmentDate: displayDate,
    appointmentTime: time,
    modalidade: appointment.modality as "presencial" | "online",
    consultorioAddress: appointment.modality === "presencial" ? config.office.fullAddress : undefined,
    meetingLink: appointment.modality === "online" ? `${config.meeting.linkBase}${appointment.id}` : undefined,
    psychologistName: config.name,
    psychologistPhone: config.phone,
  });
  const patientDelivered = patientResult.success;

  // Notificar o psicólogo (owner)
  const ownerEmail = ENV.ownerNotificationEmail;
  let ownerDelivered = false;

  if (ownerEmail) {
    // Importar sendNewContactNotification para enviar notificação ao owner
    const { sendNewContactNotification } = await import("./email");
    
    const ownerResult = await sendNewContactNotification({
      senderName: appointment.clientName,
      senderEmail: appointment.clientEmail,
      senderPhone: appointment.clientPhone,
      subject: `Novo agendamento - ${displayDate} às ${time}`,
      message: [
        `Modalidade: ${appointment.modality === "online" ? "Online" : "Presencial"}`,
        appointment.subject ? `Motivo: ${appointment.subject}` : "",
        appointment.notes ? `Observações: ${appointment.notes}` : "",
      ].filter(Boolean).join("\n"),
    });
    ownerDelivered = ownerResult.success;
  } else {
    // Fallback to Manus notification service when owner email is missing
    const summary = `${appointment.modality === "online" ? "Sessão online" : "Sessão presencial"} em ${displayDate} às ${time}`;
    ownerDelivered = await notifyOwner({
      title: "Novo agendamento",
      content: [
        summary,
        `Paciente: ${appointment.clientName}`,
        `Email: ${appointment.clientEmail}`,
        `Telefone: ${appointment.clientPhone}`,
      ].join("\n"),
    }).catch(() => false);
  }

  return { patient: patientDelivered, owner: ownerDelivered };
}

// Função mantida para compatibilidade mas agora usa o scheduler robusto
export function scheduleReminderEmail(appointment: Appointment): void {
  // Importar e usar o scheduler robusto
  import("./scheduler").then(({ scheduleAppointmentReminder }) => {
    void scheduleAppointmentReminder(appointment.id);
  }).catch((error) => {
    console.error("[Notification] Failed to schedule reminder:", error);
  });
}

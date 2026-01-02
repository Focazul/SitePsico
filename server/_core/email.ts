import { ENV } from "./env";
import {
  appointmentConfirmationTemplate,
  appointmentReminderTemplate,
  newContactNotificationTemplate,
  contactAutoReplyTemplate,
  passwordResetTemplate,
  generatePlainText,
  type EmailTemplateData,
} from "./emailTemplates";
import { insertEmailLog } from "../db";
import { emailLogs } from "../../drizzle/schema";

export type EmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export type EmailType =
  | "appointmentConfirmation"
  | "appointmentReminder"
  | "newContactNotification"
  | "contactAutoReply"
  | "passwordReset"
  | "custom";

interface SendEmailOptions {
  to: string;
  subject: string;
  type: EmailType;
  templateData?: EmailTemplateData;
  customHtml?: string;
  customText?: string;
}

const isConfigured = (): boolean =>
  Boolean(ENV.resendApiKey && ENV.resendFromEmail);

// Função básica de envio (uso interno)
async function sendEmailRaw(payload: EmailPayload): Promise<boolean> {
  if (!isConfigured()) {
    console.warn("[Email] Resend not configured; skipping email to", payload.to);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${ENV.resendApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.resendFromEmail,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send to ${payload.to} (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }

    const result = await response.json();
    console.log(`[Email] Successfully sent to ${payload.to}. ID: ${result.id}`);
    return true;
  } catch (error) {
    console.warn("[Email] Error sending email", error);
    return false;
  }
}

// Função principal de envio com templates
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  let html = options.customHtml;
  let text = options.customText;

  // Gerar HTML baseado no template
  if (!html && options.templateData) {
    switch (options.type) {
      case "appointmentConfirmation":
        html = appointmentConfirmationTemplate(
          options.templateData.appointmentConfirmation
        );
        break;
      case "appointmentReminder":
        html = appointmentReminderTemplate(
          options.templateData.appointmentReminder
        );
        break;
      case "newContactNotification":
        html = newContactNotificationTemplate(
          options.templateData.newContact
        );
        break;
      case "contactAutoReply":
        html = contactAutoReplyTemplate(options.templateData.contactAutoReply);
        break;
      case "passwordReset":
        html = passwordResetTemplate(options.templateData.passwordReset);
        break;
    }
  }

  // Gerar texto plain alternativo se não fornecido
  if (!text && html) {
    text = generatePlainText(html);
  }

  // Enviar email
  const success = await sendEmailRaw({
    to: options.to,
    subject: options.subject,
    text: text || "",
    html: html,
  });

  // Registrar log (não bloquear em caso de erro)
  try {
    await insertEmailLog({
      recipientEmail: options.to,
      subject: options.subject,
      emailType: options.type,
      status: success ? "sent" : "failed",
      sentAt: success ? new Date() : null,
    });
  } catch (error) {
    console.warn("[Email] Failed to log email:", error);
  }

  return success;
}

// Helper: Enviar confirmação de agendamento
export async function sendAppointmentConfirmation(data: {
  patientEmail: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  modalidade: "presencial" | "online";
  consultorioAddress?: string;
  meetingLink?: string;
  psychologistName: string;
  psychologistPhone: string;
}): Promise<boolean> {
  return sendEmail({
    to: data.patientEmail,
    subject: "✅ Sua consulta foi confirmada!",
    type: "appointmentConfirmation",
    templateData: {
      appointmentConfirmation: data,
    },
  });
}

// Helper: Enviar lembrete de consulta
export async function sendAppointmentReminder(data: {
  patientEmail: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  modalidade: "presencial" | "online";
  meetingLink?: string;
  psychologistName: string;
  psychologistPhone: string;
}): Promise<boolean> {
  return sendEmail({
    to: data.patientEmail,
    subject: "⏰ Lembrete: Sua consulta é amanhã!",
    type: "appointmentReminder",
    templateData: {
      appointmentReminder: data,
    },
  });
}

// Helper: Notificar novo contato ao psicólogo
export async function sendNewContactNotification(data: {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  if (!ENV.ownerNotificationEmail) {
    console.warn("[Email] Owner notification email not configured");
    return false;
  }

  return sendEmail({
    to: ENV.ownerNotificationEmail,
    subject: `📬 Novo contato: ${data.senderName}`,
    type: "newContactNotification",
    templateData: {
      newContact: {
        ...data,
        receivedAt: new Date().toLocaleString("pt-BR", {
          dateStyle: "long",
          timeStyle: "short",
        }),
      },
    },
  });
}

// Helper: Enviar auto-resposta de contato
export async function sendContactAutoReply(data: {
  recipientEmail: string;
  senderName: string;
  psychologistName: string;
}): Promise<boolean> {
  return sendEmail({
    to: data.recipientEmail,
    subject: "✅ Recebi sua mensagem!",
    type: "contactAutoReply",
    templateData: {
      contactAutoReply: {
        senderName: data.senderName,
        psychologistName: data.psychologistName,
        expectedResponseTime: "até 24 horas em dias úteis",
      },
    },
  });
}

// Helper: Enviar email de reset de senha
export async function sendPasswordReset(data: {
  recipientEmail: string;
  userName: string;
  resetLink: string;
}): Promise<boolean> {
  return sendEmail({
    to: data.recipientEmail,
    subject: "🔐 Redefinição de senha",
    type: "passwordReset",
    templateData: {
      passwordReset: {
        userName: data.userName,
        resetLink: data.resetLink,
        expirationTime: "1 hora",
      },
    },
  });
}

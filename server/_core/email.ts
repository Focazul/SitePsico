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
import { getSettingValue } from "../db";

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

export type SendEmailResult = {
  success: boolean;
  error?: string;
};

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
async function sendEmailRaw(payload: EmailPayload): Promise<SendEmailResult> {
  if (!isConfigured()) {
    console.warn("[Email] Resend not configured; skipping email to", payload.to);
    return { success: false, error: "Resend not configured (missing API Key or From Email)" };
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
      const errorMsg = `Failed to send to ${payload.to} (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`;
      console.warn(`[Email] ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    const result = await response.json();
    console.log(`[Email] Successfully sent to ${payload.to}. ID: ${result.id}`);
    return { success: true };
  } catch (error) {
    console.warn("[Email] Error sending email", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Função principal de envio com templates
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  console.log(`[Email] sendEmail called with to=${options.to}, type=${options.type}`);
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
  const result = await sendEmailRaw({
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
      status: result.success ? "sent" : "failed",
      sentAt: result.success ? new Date() : null,
    });
  } catch (error) {
    console.warn("[Email] Failed to log email:", error);
  }

  return result;
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
}): Promise<SendEmailResult> {
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
}): Promise<SendEmailResult> {
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
}): Promise<SendEmailResult> {
  console.log("[Email] sendNewContactNotification called from", data.senderEmail);
  // Prioridade: ENV.ownerNotificationEmail, senão pegar email configurado no painel
  let target = ENV.ownerNotificationEmail;
  if (!target) {
    try {
      const configured = (await getSettingValue("email")) ?? (await getSettingValue("psychologist_email"));
      if (typeof configured === "string" && configured.includes("@")) {
        target = configured;
      }
    } catch (error) {
      console.warn("[Email] Failed to resolve notification email from settings", error);
    }
  }

  if (!target) {
    console.warn("[Email] Owner notification email not configured");
    return { success: false, error: "Owner notification email not configured" };
  }

  return sendEmail({
    to: target,
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
}): Promise<SendEmailResult> {
  console.log("[Email] sendContactAutoReply called for", data.recipientEmail);
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
}): Promise<SendEmailResult> {
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

import { z } from "zod";
import {
  createMessage,
  deleteMessage,
  getMessageById,
  getMessages,
  getUnreadMessageCount,
  updateMessageStatus,
} from "../db";
import { sendContactAutoReply, sendNewContactNotification } from "../_core/email";
import { adminProcedure, rateLimitedProcedure, router } from "../_core/trpc";
import { getPsychologistConfig } from "../_core/psychologistConfig";
import { sanitizeInput, sanitizeEmail, sanitizePhone, sanitizeContent } from "../_core/sanitize";

const email = z.string().email();
const phone = z.string().min(8).optional();

export const contactRouter = router({
  // Public endpoint: send message (rate limited)
  sendMessage: rateLimitedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email,
        phone,
        subject: z.string().min(5).max(200),
        content: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input }) => {
      // Sanitize inputs to prevent XSS
      const sanitized = {
        name: sanitizeInput(input.name),
        email: sanitizeEmail(input.email),
        phone: input.phone ? sanitizePhone(input.phone) : undefined,
        subject: sanitizeInput(input.subject),
        content: sanitizeContent(input.content),
      };

      // Create message in DB
      const message = await createMessage({
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        subject: sanitized.subject,
        content: sanitized.content,
        status: "novo",
      });

      // Carregar configurações do psicólogo
      const config = await getPsychologistConfig();

      // Send professional confirmation email to user (fire-and-forget)
      void sendContactAutoReply({
        recipientEmail: sanitized.email,
        senderName: sanitized.name,
        psychologistName: config.name,
      });

      // Notify owner with professional template (fire-and-forget)
      void sendNewContactNotification({
        senderName: sanitized.name,
        senderEmail: sanitized.email,
        senderPhone: sanitized.phone,
        subject: sanitized.subject,
        message: sanitized.content,
      });

      return { success: true, id: message.id } as const;
    }),

  // Admin endpoint: get all messages
  getMessages: adminProcedure
    .input(
      z.object({
        status: z.enum(["novo", "lido", "respondido", "arquivado"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return await getMessages(input.status);
    }),

  // Admin endpoint: get unread count
  getUnreadCount: adminProcedure.query(async () => {
    const count = await getUnreadMessageCount();
    return { count };
  }),

  // Admin endpoint: get message by ID
  getMessage: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const message = await getMessageById(input.id);
      if (!message) {
        throw new Error("Mensagem não encontrada");
      }
      // Mark as read
      await updateMessageStatus(input.id, "lido");
      return message;
    }),

  // Admin endpoint: mark message as replied
  markReplied: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await updateMessageStatus(input.id, "respondido");
      return { success: true } as const;
    }),

  // Admin endpoint: update message status
  updateStatus: adminProcedure
    .input(z.object({ 
      id: z.number().int(),
      status: z.enum(["novo", "lido", "respondido", "arquivado"])
    }))
    .mutation(async ({ input }) => {
      await updateMessageStatus(input.id, input.status);
      return { success: true } as const;
    }),

  // Admin endpoint: delete message
  deleteMessage: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deleteMessage(input.id);
      return { success: true } as const;
    }),
});

export type ContactRouter = typeof contactRouter;

import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { getEmailLogs, getEmailLogStats } from "../db";
import { sendEmail } from "../_core/email";

export const emailRouter = router({
  // Send a test email
  sendTestEmail: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const success = await sendEmail({
        to: input.email,
        subject: "Teste de Configuração de Email",
        type: "custom",
        customHtml: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Teste de Configuração</h2>
            <p>Olá,</p>
            <p>Se você está lendo este email, significa que a configuração de envio de emails do sistema está funcionando corretamente!</p>
            <p>Envio realizado em: ${new Date().toLocaleString("pt-BR")}</p>
          </div>
        `,
        customText: "Teste de Configuração: Se você recebeu isso, o sistema de emails está funcionando.",
      });

      if (!success) {
        throw new Error("Falha ao enviar email. Verifique os logs do servidor.");
      }

      return { success: true };
    }),

  // Get email logs with optional filters
  getLogs: adminProcedure
    .input(
      z
        .object({
          emailType: z.string().optional(),
          status: z.enum(["sent", "failed"]).optional(),
          startDate: z.string().optional(), // ISO date string
          endDate: z.string().optional(), // ISO date string
          limit: z.number().min(1).max(1000).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const filters = input
        ? {
            ...input,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
          }
        : undefined;

      return await getEmailLogs(filters);
    }),

  // Get email statistics
  getStats: adminProcedure.query(async () => {
    return await getEmailLogStats();
  }),
});

export type EmailRouter = typeof emailRouter;

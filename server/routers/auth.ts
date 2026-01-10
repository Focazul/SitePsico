import { z } from "zod";
import { getUserByEmail, changeUserPassword, setPasswordResetToken, verifyPasswordResetToken } from "../db";
import { users } from "../../drizzle/schema";
import { hashPassword, verifyPassword, generateToken } from "../_core/auth";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { sendEmail } from "../_core/email";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email("Email inválido"),
});

const passwordResetSchema = z.object({
  token: z.string().min(1, "Token obrigatório"),
  newPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "Confirmação de senha obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const authRouter = router({
  // Login
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);

      if (!user || !verifyPassword(input.password, user.password)) {
        throw new Error("Email ou senha inválidos");
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(`user_${user.id}`, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, user: { id: user.id, email: user.email, name: user.name } };
    }),

  // Logout
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, {
      ...cookieOptions,
      maxAge: -1,
    });
    return { success: true };
  }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.email) return null;

    const user = await getUserByEmail(ctx.user.email);

    if (!user) return null;

    return { id: user.id, email: user.email, name: user.name };
  }),

  // Change password (admin only)
  changePassword: adminProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Senha atual é obrigatória"),
        newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
        confirmPassword: z.string().min(8, "Confirmação de senha é obrigatória"),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Senhas não coincidem",
        path: ["confirmPassword"],
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.email) {
        throw new Error("Não autenticado");
      }

      const user = await getUserByEmail(ctx.user.email);
      if (!user || !user.id) {
        throw new Error("Usuário não encontrado");
      }

      await changeUserPassword(user.id, input.currentPassword, input.newPassword);
      return { success: true };
    }),

  // Request password reset
  requestPasswordReset: publicProcedure
    .input(passwordResetRequestSchema)
    .mutation(async ({ input }) => {
      const user = await getUserByEmail(input.email);

      // Sempre retorna sucesso para não vazar se email existe
      if (!user || !user.id) {
        return { success: true, message: "Se o email existe, você receberá um link de recuperação" };
      }

      // Gerar token de reset
      const resetToken = generateToken(32);
      await setPasswordResetToken(user.id, resetToken, 24 * 60 * 60 * 1000); // 24 horas

      // Enviar email com link
      const resetUrl = `${process.env.FRONTEND_URL || "https://psicologo-sp-site.vercel.app"}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
      
      try {
        await sendEmail({
          to: user.email,
          subject: "Recuperar sua senha",
          html: `
            <h2>Recuperar sua senha</h2>
            <p>Você solicitou a recuperação de sua senha. Clique no link abaixo para criar uma nova:</p>
            <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background:#0284c7; color:white; text-decoration:none; border-radius:5px;">Resetar Senha</a>
            <p>Este link expira em 24 horas.</p>
            <p>Se você não solicitou isso, ignore este email.</p>
          `,
        });
      } catch (error) {
        console.error("[Auth] Failed to send password reset email:", error);
        // Não falha a requisição, apenas registra o erro
      }

      return { success: true, message: "Se o email existe, você receberá um link de recuperação" };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(passwordResetSchema)
    .mutation(async ({ input }) => {
      // Verificar token
      const userId = await verifyPasswordResetToken(input.token);
      if (!userId) {
        throw new Error("Token inválido ou expirado");
      }

      // Hash nova senha
      const hashedPassword = hashPassword(input.newPassword);

      // Atualizar senha e limpar token
      await changeUserPassword(userId, null, input.newPassword, true); // true = force change
      
      return { success: true, message: "Senha alterada com sucesso! Você pode fazer login agora." };
    }),
});

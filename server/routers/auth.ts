import { z } from "zod";
import { getUserByEmail, changeUserPassword } from "../db";
import { users } from "../../drizzle/schema";
import { hashPassword, verifyPassword } from "../_core/auth";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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
    ctx.res.clearCookie(COOKIE_NAME);
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
});

import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { getEmailLogs, getEmailLogStats } from "../db";

export const emailRouter = router({
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

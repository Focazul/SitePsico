import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { bookingRouter } from "./routers/booking";
import { blogRouter } from "./routers/blog";
import { contactRouter } from "./routers/contact";
import { settingsRouter } from "./routers/settings";
import { authRouter } from "./routers/auth";
import { emailRouter } from "./routers/email";
import { calendarRouter } from "./routers/calendar";
import { pagesRouter } from "./routers/pages";
import { router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  booking: bookingRouter,
  blog: blogRouter,
  contact: contactRouter,
  settings: settingsRouter,
  auth: authRouter,
  email: emailRouter,
  calendar: calendarRouter,
  pages: pagesRouter,
});

export type AppRouter = typeof appRouter;

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "",
  ownerNotificationEmail: process.env.OWNER_NOTIFICATION_EMAIL ?? "",
  appointmentsPerDayLimit: Number.isFinite(Number.parseInt(process.env.APPOINTMENTS_PER_DAY_LIMIT ?? "", 10))
    ? Number.parseInt(process.env.APPOINTMENTS_PER_DAY_LIMIT as string, 10)
    : null,
};

console.log("[ENV] Loaded configuration:", {
  hasResendKey: !!ENV.resendApiKey,
  resendKeyLength: ENV.resendApiKey?.length ?? 0,
  resendFromEmail: ENV.resendFromEmail,
  ownerNotificationEmail: ENV.ownerNotificationEmail,
});

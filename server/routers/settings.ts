import { z } from "zod";
import {
  getAllSettings,
  getSetting,
  getSettingValue,
  updateSetting,
  bulkUpdateSettings,
  deleteSetting,
} from "../db";
import { clearConfigCache } from "../_core/psychologistConfig";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

// Allow digits too (e.g., consultation_price_package5)
const settingKey = z.string().regex(/^[a-z0-9_]+$/, "Chave deve conter apenas letras minúsculas, números e underscores");
const settingType = z.enum(["string", "number", "boolean", "json"]);

export const settingsRouter = router({
  // Public endpoint: get all published settings (optional whitelist)
  getPublic: publicProcedure.query(async () => {
    const all = await getAllSettings();
    // Filter to only publicly safe settings (not credentials, etc.)
    const safeKeys = [
      "site_title",
      "site_description",
      "psychologist_name",
      "psychologist_crp",
      "psychologist_specialty",
      "psychologist_bio",
      "phone",
      "email",
      "address",
      "opening_hours",
      "consultation_price",
      "session_duration",
      "availability",
      "slot_interval",
      "about_text",
      "services_text",
      "instagram_url",
      "linkedin_url",
      "website",
      "whatsapp_number",
      "whatsapp_button_enabled",
      "whatsapp_default_message",
    ];

    return all.filter((s) => safeKeys.includes(s.key)).map((s) => ({ key: s.key, value: s.value }));
  }),

  // Public endpoint: get map configuration
  getMapConfig: publicProcedure.query(async () => {
    try {
      const all = await getAllSettings();
      const mapSettings = all.reduce(
        (acc, setting) => {
          if (setting.key.startsWith("map_")) {
            const key = setting.key.replace("map_", "");
            acc[key] = setting.value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      return {
        enabled: mapSettings.enabled === "true" || mapSettings.enabled === true,
        latitude: parseFloat(mapSettings.latitude) || -23.5505,
        longitude: parseFloat(mapSettings.longitude) || -46.6333,
        title: mapSettings.title || "Consultório de Psicologia",
        address: mapSettings.address || "São Paulo, SP",
        phoneNumber: mapSettings.phone_number || "(11) 99999-9999",
        hours: mapSettings.hours || "Seg-Sex: 09:00 - 18:00",
        zoom: parseInt(mapSettings.zoom) || 15,
      };
    } catch (err) {
      console.error("[Settings] Error fetching map config:", err);
      return {
        enabled: false,
        latitude: -23.5505,
        longitude: -46.6333,
        title: "Consultório de Psicologia",
        address: "São Paulo, SP",
        phoneNumber: "(11) 99999-9999",
        hours: "Seg-Sex: 09:00 - 18:00",
        zoom: 15,
      };
    }
  }),

  // Public endpoint: get GA4 configuration
  getGA4Config: publicProcedure.query(async () => {
    try {
      const all = await getAllSettings();
      const gaEnabled = all.find((s) => s.key === "google_analytics_enabled");
      const gaMeasurementId = all.find((s) => s.key === "google_analytics_measurement_id");

      return {
        enabled: gaEnabled?.value === "true" || gaEnabled?.value === true,
        measurement_id: gaMeasurementId?.value || "",
      };
    } catch (err) {
      console.error("[Settings] Error fetching GA4 config:", err);
      return {
        enabled: false,
        measurement_id: "",
      };
    }
  }),

  // Admin endpoint: get all settings
  getAll: adminProcedure.query(async () => {
    console.log("[Settings Router] getAll called");
    try {
      const settings = await getAllSettings();
      console.log("[Settings Router] Retrieved settings:", settings?.length || 0, "items");
      if (!settings) {
        console.log("[Settings Router] No settings found, returning empty array");
        return [];
      }
      return settings;
    } catch (error) {
      console.error("[Settings Router] getAll failed:", error);
      return [];
    }
  }),

  // Admin endpoint: get single setting
  getSetting: adminProcedure
    .input(z.object({ key: settingKey }))
    .query(async ({ input }) => {
      const setting = await getSetting(input.key);
      if (!setting) throw new Error("Configuração não encontrada");
      return setting;
    }),

  // Admin endpoint: get setting value (parsed)
  getValue: adminProcedure
    .input(z.object({ key: settingKey }))
    .query(async ({ input }) => {
      const value = await getSettingValue(input.key);
      return { key: input.key, value };
    }),

  // Admin endpoint: update single setting
  updateSetting: adminProcedure
    .input(
      z.object({
        key: settingKey,
        value: z.any(),
        type: settingType.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const setting = await updateSetting(input.key, input.value, input.type);
      return setting;
    }),

  // Admin endpoint: bulk update settings
  bulkUpdate: adminProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            key: settingKey,
            value: z.any(),
            type: settingType.optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      await bulkUpdateSettings(input.updates);
      clearConfigCache();
      return { success: true } as const;
    }),

  // Admin endpoint: delete setting
  deleteSetting: adminProcedure
    .input(z.object({ key: settingKey }))
    .mutation(async ({ input }) => {
      await deleteSetting(input.key);
      return { success: true } as const;
    }),
});

export type SettingsRouter = typeof settingsRouter;

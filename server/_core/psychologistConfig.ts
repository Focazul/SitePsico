// Helper para carregar configurações do psicólogo do banco de dados
import { getSettingValue } from "../db";

export interface PsychologistConfig {
  name: string;
  crp: string;
  phone: string;
  email: string;
  office: {
    street: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    zip: string;
    fullAddress: string;
  };
  meeting: {
    linkBase: string;
    provider: string;
  };
  social: {
    instagram: string;
    linkedin: string;
    facebook: string;
    whatsapp: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  pricing: {
    presential: string;
    online: string;
    duration: number;
  };
  emailSettings: {
    signature: string;
    replyTime: string;
  };
}

// Cache das configurações
let configCache: PsychologistConfig | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Carrega as configurações do psicólogo do banco de dados
 * Usa cache de 5 minutos para evitar queries excessivas
 */
export async function getPsychologistConfig(): Promise<PsychologistConfig> {
  const now = Date.now();
  
  // Retornar cache se ainda válido
  if (configCache && (now - lastCacheTime) < CACHE_TTL) {
    return configCache;
  }

  try {
    // Carregar todas as configurações
    const [
      name,
      crp,
      phone,
      email,
      street,
      complement,
      district,
      city,
      state,
      zip,
      meetingLinkBase,
      meetingProvider,
      instagram,
      linkedin,
      facebook,
      whatsapp,
      weekdays,
      saturday,
      sunday,
      pricePresential,
      priceOnline,
      duration,
      emailSignature,
      emailReplyTime,
    ] = await Promise.all([
      getSettingValue("psychologist_name"),
      getSettingValue("psychologist_crp"),
      getSettingValue("psychologist_phone"),
      getSettingValue("psychologist_email"),
      getSettingValue("office_address_street"),
      getSettingValue("office_address_complement"),
      getSettingValue("office_address_district"),
      getSettingValue("office_address_city"),
      getSettingValue("office_address_state"),
      getSettingValue("office_address_zip"),
      getSettingValue("meeting_link_base"),
      getSettingValue("meeting_provider"),
      getSettingValue("social_instagram"),
      getSettingValue("social_linkedin"),
      getSettingValue("social_facebook"),
      getSettingValue("social_whatsapp"),
      getSettingValue("office_hours_weekdays"),
      getSettingValue("office_hours_saturday"),
      getSettingValue("office_hours_sunday"),
      getSettingValue("session_price_presential"),
      getSettingValue("session_price_online"),
      getSettingValue("session_duration"),
      getSettingValue("email_signature"),
      getSettingValue("email_reply_time"),
    ]);

    // Montar endereço completo
    const addressParts = [
      street,
      complement ? `, ${complement}` : "",
      ` - ${district}`,
      `, ${city} - ${state}`,
      `, CEP ${zip}`,
    ];
    const fullAddress = addressParts.join("");

    configCache = {
      name: String(name || "Dr. [Nome do Psicólogo]"),
      crp: String(crp || "CRP 06/123456"),
      phone: String(phone || "(11) 99999-9999"),
      email: String(email || "contato@psicologo.com.br"),
      office: {
        street: String(street || "Rua Exemplo, 123"),
        complement: String(complement || ""),
        district: String(district || "Jardim Paulista"),
        city: String(city || "São Paulo"),
        state: String(state || "SP"),
        zip: String(zip || "01310-100"),
        fullAddress,
      },
      meeting: {
        linkBase: String(meetingLinkBase || "https://meet.google.com/"),
        provider: String(meetingProvider || "Google Meet"),
      },
      social: {
        instagram: String(instagram || ""),
        linkedin: String(linkedin || ""),
        facebook: String(facebook || ""),
        whatsapp: String(whatsapp || "5511999999999"),
      },
      hours: {
        weekdays: String(weekdays || "Segunda a Sexta: 8h às 18h"),
        saturday: String(saturday || "Sábado: 8h às 12h"),
        sunday: String(sunday || "Fechado"),
      },
      pricing: {
        presential: String(pricePresential || "R$ 200,00"),
        online: String(priceOnline || "R$ 180,00"),
        duration: Number(duration) || 60,
      },
      emailSettings: {
        signature: String(emailSignature || "Atenciosamente"),
        replyTime: String(emailReplyTime || "até 24 horas em dias úteis"),
      },
    };

    lastCacheTime = now;
    return configCache;
  } catch (error) {
    console.error("[PsychologistConfig] Error loading config:", error);
    
    // Retornar valores padrão em caso de erro
    return {
      name: "Dr. [Nome do Psicólogo]",
      crp: "CRP 06/123456",
      phone: "(11) 99999-9999",
      email: "contato@psicologo.com.br",
      office: {
        street: "Rua Exemplo, 123",
        complement: "",
        district: "Jardim Paulista",
        city: "São Paulo",
        state: "SP",
        zip: "01310-100",
        fullAddress: "Rua Exemplo, 123 - Jardim Paulista, São Paulo - SP, CEP 01310-100",
      },
      meeting: {
        linkBase: "https://meet.google.com/",
        provider: "Google Meet",
      },
      social: {
        instagram: "",
        linkedin: "",
        facebook: "",
        whatsapp: "5511999999999",
      },
      hours: {
        weekdays: "Segunda a Sexta: 8h às 18h",
        saturday: "Sábado: 8h às 12h",
        sunday: "Fechado",
      },
      pricing: {
        presential: "R$ 200,00",
        online: "R$ 180,00",
        duration: 60,
      },
      emailSettings: {
        signature: "Atenciosamente",
        replyTime: "até 24 horas em dias úteis",
      },
    };
  }
}

/**
 * Limpa o cache de configurações
 * Útil após atualizar configurações via admin
 */
export function clearConfigCache(): void {
  configCache = null;
  lastCacheTime = 0;
  console.log("[PsychologistConfig] Cache cleared");
}

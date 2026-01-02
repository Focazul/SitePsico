import {
  LayoutDashboard,
  Calendar,
  CalendarCheck2,
  FileText,
  Settings,
  Mail,
  Send,
  MessageSquare,
  LucideIcon,
} from "lucide-react";

export interface AdminMenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  description?: string;
}

export interface AdminMenuSection {
  section: string;
  icon?: LucideIcon;
  items: AdminMenuItem[];
}

export const adminMenuConfig: AdminMenuSection[] = [
  {
    section: "DASHBOARD",
    icon: LayoutDashboard,
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/admin/dashboard",
        description: "Visualize o resumo geral",
      },
    ],
  },
  {
    section: "AGENDAMENTOS & CALENDÁRIO",
    icon: Calendar,
    items: [
      {
        icon: Calendar,
        label: "Meus Agendamentos",
        path: "/admin/appointments",
        description: "Gerenciar agendamentos",
      },
      {
        icon: CalendarCheck2,
        label: "Calendário",
        path: "/admin/calendar",
        description: "Sincronize com Google Calendar",
      },
    ],
  },
  {
    section: "CONTEÚDO",
    icon: FileText,
    items: [
      {
        icon: FileText,
        label: "Blog",
        path: "/admin/posts",
        description: "Escrever e gerenciar artigos",
      },
      {
        icon: Settings,
        label: "Páginas",
        path: "/admin/settings?tab=pages",
        description: "Editar conteúdo das páginas",
      },
    ],
  },
  {
    section: "COMUNICAÇÃO",
    icon: Mail,
    items: [
      {
        icon: MessageSquare,
        label: "Mensagens",
        path: "/admin/messages",
        description: "Mensagens de contato recebidas",
      },
      {
        icon: Send,
        label: "Emails",
        path: "/admin/emails",
        description: "Log de emails enviados",
      },
    ],
  },
  {
    section: "CONFIGURAÇÕES",
    icon: Settings,
    items: [
      {
        icon: Settings,
        label: "Configurações Gerais",
        path: "/admin/settings",
        description: "Personalize seu site",
      },
    ],
  },
];

/**
 * Encontra a página ativa no menu baseada no path
 */
export function findActiveMenuItem(
  currentPath: string
): AdminMenuItem | undefined {
  for (const section of adminMenuConfig) {
    for (const item of section.items) {
      // Extrai apenas o path sem query params para comparação
      const itemPath = item.path.split("?")[0];
      const currentPathOnly = currentPath.split("?")[0];
      if (itemPath === currentPathOnly) {
        return item;
      }
    }
  }
  return undefined;
}

/**
 * Encontra a seção ativa baseada no path
 */
export function findActiveSection(
  currentPath: string
): AdminMenuSection | undefined {
  for (const section of adminMenuConfig) {
    for (const item of section.items) {
      const itemPath = item.path.split("?")[0];
      const currentPathOnly = currentPath.split("?")[0];
      if (itemPath === currentPathOnly) {
        return section;
      }
    }
  }
  return undefined;
}

/**
 * Formata o nome da seção para breadcrumb
 */
export function formatSectionName(section: string): string {
  return section
    .split("&")[0]
    .trim()
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

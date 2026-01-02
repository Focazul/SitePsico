import { ChevronRight, Home } from "lucide-react";
import { useLocation } from "wouter";
import { findActiveSection, formatSectionName } from "@/lib/adminMenuConfig";
import { cn } from "@/lib/utils";

interface AdminBreadcrumbProps {
  className?: string;
  showHome?: boolean;
}

export function AdminBreadcrumb({
  className,
  showHome = true,
}: AdminBreadcrumbProps) {
  const [location] = useLocation();
  const activeSection = findActiveSection(location);

  if (!activeSection) return null;

  const sectionName = formatSectionName(activeSection.section);

  return (
    <div className={cn("flex items-center gap-2 text-xs md:text-sm", className)}>
      {showHome && (
        <>
          <Home className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </>
      )}
      <span className="text-muted-foreground">Admin</span>
      <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
      <span className="font-medium text-foreground">{sectionName}</span>
    </div>
  );
}

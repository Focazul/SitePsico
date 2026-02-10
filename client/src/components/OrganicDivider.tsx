/**
 * OrganicDivider Component
 * Design: Transições sutis entre seções
 * - Gradiente vertical discreto para marcar passagem
 */

interface OrganicDividerProps {
  className?: string;
  color?: 'accent' | 'secondary' | 'muted';
}

export default function OrganicDivider({
  className = '',
  color = 'accent'
}: OrganicDividerProps) {
  const colorMap = {
    accent: 'from-accent/20 via-accent/10 to-transparent',
    secondary: 'from-secondary/20 via-secondary/10 to-transparent',
    muted: 'from-muted/30 via-muted/15 to-transparent'
  };

  return (
    <div className={`w-full h-16 md:h-20 ${className}`}>
      <div className={`w-full h-full bg-gradient-to-b ${colorMap[color]} opacity-60`}></div>
    </div>
  );
}

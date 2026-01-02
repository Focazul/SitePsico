/**
 * OrganicDivider Component
 * Design: Identidade Visual Única - Azul + Turquesa
 * - Separadores com ondas decorativas orgânicas
 * - Elemento assinatura do design
 */

interface OrganicDividerProps {
  className?: string;
  color?: 'accent' | 'secondary' | 'muted';
}

export default function OrganicDivider({ 
  className = '', 
  color = 'accent' 
}: OrganicDividerProps) {
  return (
    <div className={`w-full overflow-hidden py-8 md:py-12 ${className}`}>
      <div className="flex justify-center">
        <img 
          src="/images/accent-waves.png" 
          alt="Divisor decorativo" 
          className="w-32 h-16 md:w-48 md:h-24 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </div>
  );
}

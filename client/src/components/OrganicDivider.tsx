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
  const colorMap = {
    accent: '#c9a961',
    secondary: '#2E5EA8',
    muted: '#DCE8F7'
  };

  return (
    <div className={`w-full overflow-hidden py-8 md:py-12 ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-16 md:h-24 transition-all duration-500 hover:animate-wave"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
      >
        <path
          d="M0,60 C300,100 600,20 900,60 C1050,80 1200,40 1200,60 L1200,120 L0,120 Z"
          fill={colorMap[color]}
          className="animate-wave"
        />
        <style jsx>{`
          @keyframes wave {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-10px); }
          }
          .animate-wave {
            animation: wave 4s ease-in-out infinite;
          }
        `}</style>
      </svg>
    </div>
  );
}

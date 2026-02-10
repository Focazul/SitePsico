/**
 * OrganicDivider Component
 * Design: Elementos visuais sutis para transições
 * - SVG decorativo com formas minimalistas
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
    <div className={`w-full py-8 md:py-12 flex justify-center ${className}`}>
      <svg
        width="200"
        height="40"
        viewBox="0 0 200 40"
        className="opacity-40 hover:opacity-60 transition-opacity duration-500"
      >
        {/* Linha ondulada sutil */}
        <path
          d="M0,20 Q50,10 100,20 T200,20"
          stroke={colorMap[color]}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          className="animate-pulse"
        />
        {/* Pontos decorativos */}
        <circle cx="50" cy="15" r="2" fill={colorMap[color]} opacity="0.6" />
        <circle cx="150" cy="25" r="2" fill={colorMap[color]} opacity="0.6" />
        {/* Forma geométrica sutil */}
        <polygon
          points="100,5 105,15 95,15"
          fill={colorMap[color]}
          opacity="0.3"
          className="animate-bounce"
          style={{ animationDelay: '1s', animationDuration: '3s' }}
        />
      </svg>
    </div>
  );
}

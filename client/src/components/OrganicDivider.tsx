/**
 * OrganicDivider Component
 * Design: Elementos visuais sutis para transições
 * - SVG decorativo com formas minimalistas inspiradas em psicologia e lapis lazuli
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
        {/* Símbolo de equilíbrio (yin-yang) inspirado em psicologia */}
        <g transform="translate(100,20)">
          <circle cx="0" cy="0" r="8" fill={colorMap.secondary} opacity="0.4" />
          <path
            d="M0,-8 A8,8 0 0,1 0,8 A4,4 0 0,0 0,0 A4,4 0 0,1 0,-8 Z"
            fill={colorMap.accent}
            opacity="0.6"
          />
          <circle cx="0" cy="-4" r="1.5" fill={colorMap.secondary} />
          <circle cx="0" cy="4" r="1.5" fill={colorMap.accent} />
        </g>
      </svg>
    </div>
  );
}

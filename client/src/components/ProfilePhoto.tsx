import { User } from 'lucide-react';

/**
 * ProfilePhoto Component
 * 
 * Componente para exibir foto profissional do psicólogo
 * Com fallback para placeholder quando não houver imagem
 * 
 * @param src - URL da imagem
 * @param alt - Texto alternativo
 * @param size - Tamanho do componente ('sm' | 'md' | 'lg' | 'xl')
 */

interface ProfilePhotoProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

const iconSizes = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export default function ProfilePhoto({
  src,
  alt = 'Foto profissional',
  size = 'lg',
  className = '',
}: ProfilePhotoProps) {
  const hasImage = src && src !== '';

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-accent/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-accent/60 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 ${className}`}
    >
      {hasImage ? (
        <div className="relative w-full h-full group">
          <img
            src={src}
            alt={alt}
            width="400"
            height="400"
            className="w-full h-full object-cover filter group-hover:brightness-110 group-hover:contrast-105 transition-all duration-500"
            loading="lazy"
          />
          {/* Overlay sutil para integração com tema */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-40 group-hover:opacity-20 transition-opacity duration-500 rounded-full"></div>
        </div>
      ) : (
        // Placeholder quando não houver imagem
        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center border-2 border-accent/30">
          <User className={`${iconSizes[size]} text-accent/70`} />
        </div>
      )}
    </div>
  );
}

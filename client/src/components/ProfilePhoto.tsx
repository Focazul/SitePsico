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
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-accent/20 shadow-lg ${className}`}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          width="400"
          height="400"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        // Placeholder quando não houver imagem
        <div className="w-full h-full bg-accent/10 flex items-center justify-center">
          <User className={`${iconSizes[size]} text-accent/50`} />
        </div>
      )}
    </div>
  );
}

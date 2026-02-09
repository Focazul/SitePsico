/**
 * ImageGallery Component
 * 
 * Galeria de imagens responsiva com efeitos hover
 * Pode ser usada para mostrar o consultório, ambiente, etc.
 */

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
    caption?: string;
  }[];
  columns?: 2 | 3 | 4;
}

export default function ImageGallery({
  images,
  columns = 3,
}: ImageGalleryProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
      {images.map((image, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-accent/50"
        >
          <div className="aspect-[4/3] relative">
            <img
              src={image.src}
              alt={image.alt}
              width="800"
              height="600"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter group-hover:brightness-110 group-hover:contrast-105"
              loading="lazy"
            />
            {/* Overlay temático Lápis-Lázuli */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-primary/20 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium drop-shadow-lg">
                    {image.caption}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

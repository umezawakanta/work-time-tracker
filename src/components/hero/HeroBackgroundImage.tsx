import React from 'react';

export interface HeroBackgroundImageProps {
  webpSrc?: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  priority?: 'high' | 'low';
  width?: number;
  height?: number;
}

export const HeroBackgroundImage: React.FC<HeroBackgroundImageProps> = ({
  webpSrc,
  fallbackSrc,
  alt = '',
  className,
  priority = 'low',
  width,
  height,
}) => {
  if (!webpSrc && !fallbackSrc) return null;

  const loading = priority === 'high' ? 'eager' : 'lazy';
  // Avoid fetchPriority attribute for broader React type compatibility

  return (
    <picture className={className || ''} aria-hidden={alt === ''}>
      {webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
      {fallbackSrc ? (
        <img
          src={fallbackSrc}
          alt={alt}
          loading={loading as 'eager' | 'lazy'}
          decoding="async"
          sizes="100vw"
          width={width}
          height={height}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : null}
    </picture>
  );
};

export default HeroBackgroundImage;

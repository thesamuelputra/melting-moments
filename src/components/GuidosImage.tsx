'use client';

import { useState } from 'react';
import Image from 'next/image';

const PLACEHOLDER = '/guidos/placeholder.svg';

type GuidosImageProps = {
  src?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

/**
 * next/image with a "placeholder-first" fallback for the Guido's pages.
 *
 * The "Coming Soon" placeholder is always rendered behind the image; the real
 * photo fades in only once it has successfully loaded (onLoad). If the source
 * asset is missing (the optimizer 400/404s), onLoad never fires and the
 * placeholder simply stays, so there is never a broken/black box, regardless of
 * lazy-loading timing. Real product photography appears automatically once the
 * files are added to /public/guidos. The placeholder is a CSS background so the
 * SVG never passes through the image optimizer.
 */
export default function GuidosImage({
  src,
  alt = '',
  sizes,
  priority,
  fill = true,
  style,
  className,
}: GuidosImageProps) {
  const [loaded, setLoaded] = useState(false);
  const isRealPhoto = !!src && !src.endsWith('.svg');

  return (
    <>
      <div
        role="img"
        aria-label={alt || 'Photo coming soon'}
        aria-hidden={loaded || undefined}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#2d2d2d',
          backgroundImage: `url(${PLACEHOLDER})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      />
      {isRealPhoto && (
        <Image
          src={src}
          alt={alt}
          sizes={sizes}
          priority={priority}
          fill={fill}
          className={className}
          style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
    </>
  );
}

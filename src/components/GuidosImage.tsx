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
 * The "Coming Soon" placeholder is always rendered behind the image. A lazy
 * image fades in only once it has successfully loaded (onLoad); the priority
 * hero renders at full opacity immediately so its fade never defers LCP. If the
 * source asset is missing (the optimizer 400/404s), onError drops the image
 * back to the placeholder, so there is never a broken/black box, regardless of
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
  const [failed, setFailed] = useState(false);
  const isRealPhoto = !!src && !src.endsWith('.svg');

  // Priority (LCP) images show at full opacity from first paint so the fade
  // never defers LCP; everything else fades in on load. Either way a load
  // failure drops back to the placeholder.
  const imageVisible = !failed && (priority || loaded);

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
          // Only one of placeholder/image is in the a11y tree at a time, so the
          // alt is never announced twice: the placeholder speaks while loading,
          // the image once it has loaded.
          aria-hidden={!loaded}
          sizes={sizes}
          priority={priority}
          fill={fill}
          className={className}
          style={{ ...style, opacity: imageVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(false); setFailed(true); }}
        />
      )}
    </>
  );
}

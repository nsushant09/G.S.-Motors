import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbox } from '../components/Lightbox';
import { usePageMeta } from '../hooks/usePageMeta';
import { getGallery, resolveImageUrl } from '../lib/api';
import type { GalleryImage } from '../types';

export function Gallery() {
  usePageMeta('Gallery', 'A look at the cars that have passed through the GS Motors lot.');

  const [images, setImages] = useState<GalleryImage[] | null>(null);
  const [activeBodyType, setActiveBodyType] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getGallery()
      .then((data) => {
        if (!cancelled) setImages(data);
      })
      .catch(() => {
        if (!cancelled) setImages([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bodyTypes = useMemo(() => {
    if (!images) return [];
    return Array.from(new Set(images.map((img) => img.bodyType))).sort();
  }, [images]);

  const filtered = useMemo(() => {
    if (!images) return [];
    return activeBodyType ? images.filter((img) => img.bodyType === activeBodyType) : images;
  }, [images, activeBodyType]);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 md:px-10 md:pt-32">
      <h1 className="font-display text-3xl tracking-tight text-forest md:text-4xl">Gallery</h1>
      <p className="mt-2 max-w-xl text-sm text-slate">
        A look at the cars that have passed through the lot — click any photo for a closer look.
      </p>

      {bodyTypes.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveBodyType(null)}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
              activeBodyType === null ? 'border-forest bg-forest text-cream' : 'border-moss/25 text-slate hover:border-moss/50'
            }`}
          >
            All
          </button>
          {bodyTypes.map((bt) => (
            <button
              key={bt}
              type="button"
              onClick={() => setActiveBodyType(bt)}
              className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                activeBodyType === bt ? 'border-forest bg-forest text-cream' : 'border-moss/25 text-slate hover:border-moss/50'
              }`}
            >
              {bt}
            </button>
          ))}
        </div>
      )}

      {images === null && <p className="mt-16 text-center text-slate">Loading&hellip;</p>}
      {images !== null && filtered.length === 0 && <p className="mt-16 text-center text-slate">No photos to show.</p>}

      <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4">
        {filtered.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded bg-forest-deep"
          >
            <img
              src={resolveImageUrl(img.src)}
              alt={img.alt}
              loading="lazy"
              className="w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <Lightbox
          images={filtered.map((img) => ({ src: resolveImageUrl(img.src), alt: img.alt }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          footer={
            <Link to={`/cars/${filtered[lightboxIndex].slug}`} className="underline underline-offset-2 hover:text-cream">
              View this car
            </Link>
          }
        />
      )}
    </div>
  );
}

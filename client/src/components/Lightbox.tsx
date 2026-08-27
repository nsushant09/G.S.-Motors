import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  footer?: React.ReactNode;
}

export function Lightbox({ images, index, onClose, onNavigate, footer }: LightboxProps) {
  const image = images[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, images.length, onClose, onNavigate]);

  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex flex-col bg-forest-deep/95"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded text-cream md:right-6 md:top-6"
        >
          <X size={26} />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate((index - 1 + images.length) % images.length);
              }}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-cream hover:bg-cream/10 md:left-6"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate((index + 1) % images.length);
              }}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-cream hover:bg-cream/10 md:right-6"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        <div className="flex flex-1 items-center justify-center p-6 md:p-16">
          <motion.img
            key={image.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            src={image.src}
            alt={image.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded object-contain"
          />
        </div>

        {(footer || images.length > 1) && (
          <div
            className="flex items-center justify-between px-6 pb-6 font-mono text-xs text-cream/60 md:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span>
              {images.length > 1 ? `${index + 1} / ${images.length}` : ''}
            </span>
            {footer}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, Phone } from 'lucide-react';
import { Odometer } from '../components/Odometer';
import { Lightbox } from '../components/Lightbox';
import { CarCard } from '../components/CarCard';
import { usePageMeta } from '../hooks/usePageMeta';
import { getCar, getCars, resolveImageUrl } from '../lib/api';
import { formatKm, formatNPR } from '../lib/format';
import { BUSINESS } from '../lib/constants';
import type { Car } from '../types';

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

export function CarDetail() {
  const { slug = '' } = useParams();
  const [car, setCar] = useState<Car | null | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [similar, setSimilar] = useState<Car[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCar(undefined);
    setActiveIndex(0);
    getCar(slug)
      .then((data) => {
        if (!cancelled) setCar(data);
      })
      .catch(() => {
        if (!cancelled) setCar(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!car) return;
    getCars({ bodyType: car.bodyType, limit: 4 })
      .then((res) => setSimilar(res.data.filter((c) => c.slug !== car.slug).slice(0, 3)))
      .catch(() => setSimilar([]));
  }, [car]);

  usePageMeta(
    car ? `${car.year} ${car.make} ${car.model}` : 'Car detail',
    car ? car.description : 'Second-hand vehicle detail.',
    car?.images[0]
  );

  useEffect(() => {
    if (!car || lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + car.images.length) % car.images.length);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % car.images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [car, lightboxOpen]);

  if (car === undefined) {
    return <div className="px-6 py-32 text-center text-slate">Loading&hellip;</div>;
  }

  if (car === null) {
    return (
      <div className="flex flex-col items-center px-6 py-32 text-center">
        <h1 className="font-display text-2xl text-forest">Car not found</h1>
        <p className="mt-2 text-sm text-slate">It may have been sold, or the link is out of date.</p>
        <Link to="/listings" className="mt-6 rounded-full bg-forest px-6 py-3 text-sm text-cream">
          Browse cars
        </Link>
      </div>
    );
  }

  const sold = car.status === 'sold';

  const specs: [string, string][] = [
    ['Make', car.make],
    ['Model', car.model],
    ...(car.variant ? ([['Variant', car.variant]] as [string, string][]) : []),
    ['Year', String(car.year)],
    ['Kilometres driven', formatKm(car.kmDriven)],
    ['Fuel', car.fuel],
    ['Transmission', car.transmission],
    ['Body type', car.bodyType],
    ['Ownership', `${ordinal(car.ownership)} owner`],
    ['Registration', car.registrationProvince],
    ...(car.numberPlateZone ? ([['Number plate', car.numberPlateZone]] as [string, string][]) : []),
    ['Colour', car.color],
    ...(car.seats ? ([['Seats', String(car.seats)]] as [string, string][]) : []),
    ...(car.engineCC ? ([['Engine', `${car.engineCC} cc`]] as [string, string][]) : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 md:px-10 md:pt-32">
      <h1 className="sr-only">
        {car.year} {car.make} {car.model}
      </h1>
      <nav className="mb-6 font-mono text-xs text-slate/60">
        <Link to="/listings" className="hover:text-forest">
          Listings
        </Link>{' '}
        / {car.make} {car.model}
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div
            className="relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded bg-forest-deep"
            onClick={() => setLightboxOpen(true)}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const delta = e.changedTouches[0].clientX - touchStartX;
              if (delta > 50) setActiveIndex((i) => (i - 1 + car.images.length) % car.images.length);
              if (delta < -50) setActiveIndex((i) => (i + 1) % car.images.length);
              setTouchStartX(null);
            }}
          >
            <img
              src={resolveImageUrl(car.images[activeIndex])}
              alt={`${car.year} ${car.make} ${car.model} — photo ${activeIndex + 1}`}
              className={`h-full w-full object-cover ${sold ? 'grayscale' : ''}`}
            />
            {car.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i - 1 + car.images.length) % car.images.length);
                  }}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-forest-deep/70 p-2 text-cream"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i + 1) % car.images.length);
                  }}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-forest-deep/70 p-2 text-cream"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
            {car.status !== 'available' && (
              <span className="absolute left-3 top-3 rounded bg-forest-deep/90 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-cream">
                {car.status}
              </span>
            )}
          </div>

          {car.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {car.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded border ${
                    i === activeIndex ? 'border-moss' : 'border-transparent'
                  }`}
                >
                  <img src={resolveImageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-xl text-forest">Description</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate">{car.description}</p>
            {car.highlights.length > 0 && (
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {car.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-slate">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-10">
            <h2 className="font-display text-xl text-forest">Specifications</h2>
            <div className="mt-3 overflow-hidden rounded border border-moss/15 font-mono text-sm">
              {specs.map(([label, value], i) => (
                <div key={label} className={`flex justify-between px-4 py-2.5 ${i % 2 === 0 ? 'bg-bone' : 'bg-moss/5'}`}>
                  <span className="text-slate/60">{label}</span>
                  <span className="text-forest">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="rounded border border-moss/20 p-6">
            {car.status !== 'available' && (
              <span className="mb-3 inline-block rounded bg-forest-deep px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-cream">
                {car.status}
              </span>
            )}
            <Odometer value={car.priceNPR} format={formatNPR} className="block font-display text-3xl text-forest" />
            {car.negotiable && <p className="mt-1 text-xs text-slate/60">Negotiable</p>}

            <div className="mt-6 flex flex-col gap-3">
              <a
                href={`tel:${BUSINESS.phone}`}
                className="flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
              >
                <Phone size={16} /> Call about this car
              </a>
              <a
                href={`${BUSINESS.whatsappLink}?text=${encodeURIComponent(
                  `Hi, I'm interested in the ${car.year} ${car.make} ${car.model}${car.variant ? ` ${car.variant}` : ''}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-moss/30 px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/5"
              >
                <MessageCircle size={16} /> Message on WhatsApp
              </a>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl tracking-tight text-forest">Similar cars</h2>
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((c) => (
              <CarCard key={c._id} car={c} />
            ))}
          </div>
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={car.images.map((src, i) => ({ src: resolveImageUrl(src), alt: `${car.make} ${car.model} — photo ${i + 1}` }))}
          index={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Odometer } from './Odometer';
import { formatKm, formatNPR } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import type { Car } from '../types';

interface CarCardProps {
  car: Car;
  variant?: 'default' | 'featured';
}

export function CarCard({ car, variant = 'default' }: CarCardProps) {
  const disabled = car.status === 'sold';
  const thumbnail = car.images[0];
  const large = variant === 'featured';

  const inner = (
    <>
      <div
        className={`relative overflow-hidden rounded bg-forest-deep ${large ? 'aspect-[16/11] md:aspect-[4/3]' : 'aspect-[16/10]'}`}
      >
        {thumbnail && (
          <img
            src={resolveImageUrl(thumbnail)}
            alt={`${car.year} ${car.make} ${car.model}${car.variant ? ` ${car.variant}` : ''}`}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-[400ms] ${
              disabled ? 'grayscale' : 'group-hover:scale-[1.03]'
            }`}
          />
        )}
        {car.status !== 'available' && (
          <span className="absolute left-3 top-3 rounded bg-forest-deep/90 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-cream">
            {car.status}
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className={`font-display tracking-tight text-forest ${large ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          {car.year} {car.make} {car.model}
        </h3>
        <p className={`mt-1 font-mono text-slate/70 ${large ? 'text-xs md:text-sm' : 'text-xs'}`}>
          {formatKm(car.kmDriven)} &middot; {car.fuel} &middot; {car.transmission}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <Odometer
            value={car.priceNPR}
            format={formatNPR}
            className={`font-display text-forest ${large ? 'text-2xl md:text-3xl' : 'text-xl'}`}
          />
          {car.negotiable && <span className="text-xs text-slate/60">Negotiable</span>}
        </div>
      </div>
    </>
  );

  if (disabled) {
    return <div className="group opacity-60">{inner}</div>;
  }

  return (
    <Link to={`/cars/${car.slug}`} className="group block">
      {inner}
    </Link>
  );
}

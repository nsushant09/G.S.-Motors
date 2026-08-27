import { Clock, MapPin, Phone } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { Odometer } from '../components/Odometer';
import { formatNumber } from '../lib/format';
import { BUSINESS, LOCATION } from '../lib/constants';

export function About() {
  usePageMeta('About', 'Who we are, where the lot is, and how to reach GS Motors in Kathmandu.');

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 md:px-10 md:pt-32">
      <h1 className="font-display text-3xl tracking-tight text-forest md:text-4xl">About GS Motors</h1>

      <div className="mt-8 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <div>
          <p className="max-w-xl text-lg leading-relaxed text-slate">
            For five years, GS Motors has been helping buyers and sellers across Kathmandu and the rest of Nepal
            find a fair deal on their next vehicle. We inspect every car before it goes on the lot, keep the
            paperwork straight, and put the price in the open — no back-room haggling.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate/80">
            We&apos;re a small team, and we like it that way — every car that comes through here gets looked at
            properly, by someone who&apos;ll put their name to it.
          </p>

          <div className="mt-10 flex gap-10">
            <div>
              <Odometer value={BUSINESS.yearsInBusiness} format={formatNumber} className="font-display text-3xl text-forest" />
              <p className="mt-1 font-mono text-xs text-slate/60">years in business</p>
            </div>
            <div>
              <Odometer value={BUSINESS.carsSold} format={formatNumber} className="font-display text-3xl text-forest" />
              <p className="mt-1 font-mono text-xs text-slate/60">cars sold</p>
            </div>
            <div>
              <Odometer value={BUSINESS.provincesServed} format={formatNumber} className="font-display text-3xl text-forest" />
              <p className="mt-1 font-mono text-xs text-slate/60">provinces served</p>
            </div>
          </div>

          <div className="mt-10 space-y-3 border-t border-moss/15 pt-8">
            <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-3 text-sm text-slate transition-colors hover:text-forest">
              <Phone size={16} className="text-moss" /> {BUSINESS.phoneDisplay}
            </a>
            <div className="flex items-start gap-3 text-sm text-slate">
              <MapPin size={16} className="mt-0.5 shrink-0 text-moss" /> {BUSINESS.address}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate">
              <Clock size={16} className="text-moss" /> {BUSINESS.hours}
            </div>
          </div>
        </div>

        <div>
          <div className="aspect-[4/3] overflow-hidden rounded border border-moss/20 lg:aspect-auto lg:h-full">
            <iframe
              title="GS Motors location"
              src={LOCATION.embedSrc}
              className="h-full min-h-[320px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={LOCATION.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-mono text-xs uppercase tracking-wide text-moss underline underline-offset-2"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

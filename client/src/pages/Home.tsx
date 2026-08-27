import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Banknote, ClipboardCheck, Send } from 'lucide-react';
import { HeroMotion } from '../components/HeroMotion';
import { Odometer } from '../components/Odometer';
import { CarCard } from '../components/CarCard';
import { CarCardSkeleton } from '../components/Skeleton';
import { getFeaturedCars } from '../lib/api';
import { formatNumber } from '../lib/format';
import { BUSINESS } from '../lib/constants';
import { usePageMeta } from '../hooks/usePageMeta';
import type { Car } from '../types';

const HOW_IT_WORKS = [
  {
    icon: Send,
    n: '01',
    title: 'Tell us about it',
    body: "Fill in your car's details and a few photos — takes about five minutes.",
  },
  {
    icon: ClipboardCheck,
    n: '02',
    title: 'We inspect & call',
    body: 'Our team reviews it and calls within one working day with a fair quote.',
  },
  {
    icon: Banknote,
    n: '03',
    title: 'Get paid',
    body: 'Accept the quote and get paid on the spot. We handle the paperwork.',
  },
];

const WHY_US = [
  {
    n: '01',
    title: 'Paperwork, done properly',
    body: 'Ownership, tax, and transfer documents are checked before a car is listed — not scrambled together after you\'ve agreed to buy.',
  },
  {
    n: '02',
    title: '120-point inspection',
    body: 'Engine, electrics, suspension and body — every car on the lot has been through the same checklist before it goes up for sale.',
  },
  {
    n: '03',
    title: 'Price shown up front',
    body: 'The number on the card is the number we start at. No back-room haggling before we tell you what it actually costs.',
  },
];

export function Home() {
  usePageMeta(
    'GS Motors',
    "Inspected, documented, and priced in the open. Browse second-hand cars in Kathmandu or get a quote for your own."
  );

  const [featured, setFeatured] = useState<Car[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFeaturedCars()
      .then((cars) => {
        if (!cancelled) setFeatured(cars);
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-forest">
        <HeroMotion />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-10">
          <p className="font-mono text-xs tracking-[0.2em] text-cream/60">SECOND-HAND VEHICLES &middot; KATHMANDU</p>

          <h1 className="mt-4 font-display text-5xl leading-[0.9] tracking-tighter text-cream md:text-7xl lg:text-8xl">
            <span className="block">Bought right.</span>
            <span className="-mt-2 block text-[#5B9575]">Sold honest.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/70">
            Inspected, documented, and priced in the open. Every vehicle on this lot.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/listings"
              className="rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-cream/90"
            >
              Browse cars
            </Link>
            <Link
              to="/sell"
              className="rounded-full border border-cream/40 px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-cream/10"
            >
              Get a quote for yours
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 z-10 flex gap-6 md:bottom-12 md:left-10 md:gap-10">
          <Odometer
            value={BUSINESS.carsSold}
            format={(n) => `${formatNumber(n)} cars sold`}
            className="text-sm text-cream/80 md:text-base"
          />
          <Odometer
            value={BUSINESS.yearsInBusiness}
            format={(n) => `${formatNumber(n)} years`}
            className="text-sm text-cream/80 md:text-base"
          />
          <Odometer
            value={BUSINESS.provincesServed}
            format={(n) => `${formatNumber(n)} provinces served`}
            className="text-sm text-cream/80 md:text-base"
          />
        </div>
      </section>

      {/* Featured cars — one spotlight pick, two in support */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-32">
        <h2 className="font-display text-3xl tracking-tight text-forest md:text-4xl">Featured this week</h2>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:grid-rows-2 md:gap-y-8">
          {featured === null &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={i === 0 ? 'md:col-span-2 md:row-span-2' : ''}>
                <CarCardSkeleton variant={i === 0 ? 'featured' : 'default'} />
              </div>
            ))}
          {featured?.map((car, i) => (
            <motion.div
              key={car._id}
              className={i === 0 ? 'md:col-span-2 md:row-span-2' : ''}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <CarCard car={car} variant={i === 0 ? 'featured' : 'default'} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why us — ghost numerals behind each column, hairline dividers between */}
      <section className="bg-bone">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-32">
          <div className="grid grid-cols-1 gap-y-14 md:grid-cols-3 md:divide-x md:divide-moss/15">
            {WHY_US.map((item, i) => (
              <div key={item.n} className={`relative ${i > 0 ? 'md:pl-10' : ''} ${i < WHY_US.length - 1 ? 'md:pr-10' : ''}`}>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 left-0 select-none font-display text-8xl text-moss/[0.08] md:-top-6 md:text-9xl"
                >
                  {item.n}
                </span>
                <div className="relative pt-10 md:pt-14">
                  <h3 className="font-display text-xl tracking-tight text-forest">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sell your car band */}
      <section className="bg-forest">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-20 md:flex-row md:items-center md:justify-between md:px-10 md:py-24">
          <p className="font-display text-2xl tracking-tight text-cream md:text-3xl">
            Selling your car? Get a fair quotation in one working day.
          </p>
          <Link
            to="/sell"
            className="shrink-0 rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-cream/90"
          >
            Get a quote
          </Link>
        </div>
      </section>

      {/* How selling works — the bone break between the forest CTA band and the forest footer */}
      <section className="bg-bone">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-32">
          <h2 className="font-display text-3xl tracking-tight text-forest md:text-4xl">How selling works</h2>
          <div className="relative mt-14 grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-10">
            <div aria-hidden className="absolute left-0 right-0 top-8 hidden h-px bg-moss/20 md:block" />
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="relative">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-forest text-cream">
                    <Icon size={22} />
                  </div>
                  <p className="mt-5 font-mono text-xs tracking-[0.15em] text-moss">STEP {step.n}</p>
                  <h3 className="mt-2 font-display text-xl tracking-tight text-forest">{step.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

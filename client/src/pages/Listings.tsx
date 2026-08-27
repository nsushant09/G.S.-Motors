import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilterBar } from '../components/FilterBar';
import { CarCard } from '../components/CarCard';
import { CarCardSkeleton } from '../components/Skeleton';
import { usePageMeta } from '../hooks/usePageMeta';
import { getCars, CarsQueryParams } from '../lib/api';
import type { Car, ListMeta } from '../types';

const LIMIT = 12;

function paramsFromSearch(sp: URLSearchParams): CarsQueryParams {
  const str = (k: string) => sp.get(k) || undefined;
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  return {
    make: str('make'),
    bodyType: str('bodyType') as CarsQueryParams['bodyType'],
    fuel: str('fuel') as CarsQueryParams['fuel'],
    transmission: str('transmission') as CarsQueryParams['transmission'],
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    sort: (str('sort') as CarsQueryParams['sort']) || 'newest',
  };
}

export function Listings() {
  usePageMeta('Listings', 'Browse inspected second-hand cars in Kathmandu, priced in NPR.');

  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => paramsFromSearch(searchParams), [searchParams]);
  const filterKey = JSON.stringify(filters);

  const [cars, setCars] = useState<Car[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);

    getCars({ ...filters, page: 1, limit: LIMIT })
      .then((res) => {
        if (cancelled) return;
        setCars(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load cars');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    getCars({ ...filters, page: nextPage, limit: LIMIT })
      .then((res) => {
        setCars((prev) => [...prev, ...res.data]);
        setMeta(res.meta);
        setPage(nextPage);
      })
      .finally(() => setLoadingMore(false));
  };

  const onChange = (patch: Partial<CarsQueryParams>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  };

  const onClear = () => setSearchParams({}, { replace: true });

  const hasMore = meta ? meta.page < meta.pages : false;

  return (
    <>
      <section className="border-b border-moss/15 bg-bone px-6 pb-8 pt-28 md:px-10 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-3xl tracking-tight text-forest md:text-4xl">Listings</h1>
          <p className="mt-2 font-mono text-xs text-slate/70">
            {meta ? `${meta.total} car${meta.total === 1 ? '' : 's'} available` : 'Loading cars…'}
          </p>
        </div>
      </section>

      <FilterBar filters={filters} onChange={onChange} onClear={onClear} />

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        {error && <p className="text-sm text-red-700">{error}</p>}

        {!loading && !error && cars.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="text-slate">No cars match these filters.</p>
            <button
              type="button"
              onClick={onClear}
              className="mt-4 rounded-full border border-moss/25 px-5 py-2 text-sm text-forest transition-colors hover:bg-moss/5"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)}
          {!loading &&
            cars.map((car, i) => (
              <motion.div
                key={car._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % LIMIT) * 0.04 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
        </div>

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border border-moss/30 px-8 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/5 disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </section>
    </>
  );
}

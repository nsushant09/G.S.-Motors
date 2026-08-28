import { useState, type SelectHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { BODY_TYPES, FUEL_TYPES, MAKES, SORT_OPTIONS, TRANSMISSIONS } from '../lib/constants';
import type { CarsQueryParams } from '../lib/api';

interface FilterBarProps {
  filters: CarsQueryParams;
  onChange: (patch: Partial<CarsQueryParams>) => void;
  onClear: () => void;
}

const selectClass =
  'rounded border border-moss/25 bg-bone px-3 py-2 font-mono text-xs text-slate focus:border-moss';

function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${selectClass} appearance-none pr-8 ${className ?? ''}`}>
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate/50"
      />
    </div>
  );
}

function Fields({ filters, onChange }: { filters: CarsQueryParams; onChange: FilterBarProps['onChange'] }) {
  return (
    <>
      <Select
        value={filters.make ?? ''}
        onChange={(e) => onChange({ make: e.target.value || undefined })}
        aria-label="Make"
      >
        <option value="">All makes</option>
        {MAKES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>

      <Select
        value={filters.bodyType ?? ''}
        onChange={(e) => onChange({ bodyType: e.target.value || undefined })}
        aria-label="Body type"
      >
        <option value="">All body types</option>
        {BODY_TYPES.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </Select>

      <Select
        value={filters.fuel ?? ''}
        onChange={(e) => onChange({ fuel: e.target.value || undefined })}
        aria-label="Fuel"
      >
        <option value="">All fuel</option>
        {FUEL_TYPES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </Select>

      <Select
        value={filters.transmission ?? ''}
        onChange={(e) => onChange({ transmission: e.target.value || undefined })}
        aria-label="Transmission"
      >
        <option value="">All transmissions</option>
        {TRANSMISSIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>

      <input
        type="number"
        inputMode="numeric"
        placeholder="Min NPR"
        className={`${selectClass} w-28`}
        value={filters.minPrice ?? ''}
        onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
        aria-label="Minimum price"
      />
      <input
        type="number"
        inputMode="numeric"
        placeholder="Max NPR"
        className={`${selectClass} w-28`}
        value={filters.maxPrice ?? ''}
        onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
        aria-label="Maximum price"
      />

      <Select
        value={filters.sort ?? 'newest'}
        onChange={(e) => onChange({ sort: e.target.value as CarsQueryParams['sort'] })}
        aria-label="Sort"
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    </>
  );
}

function activeChips(filters: CarsQueryParams) {
  const chips: { key: keyof CarsQueryParams; label: string }[] = [];
  if (filters.make) chips.push({ key: 'make', label: filters.make });
  if (filters.bodyType) chips.push({ key: 'bodyType', label: filters.bodyType });
  if (filters.fuel) chips.push({ key: 'fuel', label: filters.fuel });
  if (filters.transmission) chips.push({ key: 'transmission', label: filters.transmission });
  if (filters.minPrice) chips.push({ key: 'minPrice', label: `Min Rs. ${filters.minPrice.toLocaleString('en-US')}` });
  if (filters.maxPrice) chips.push({ key: 'maxPrice', label: `Max Rs. ${filters.maxPrice.toLocaleString('en-US')}` });
  return chips;
}

export function FilterBar({ filters, onChange, onClear }: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const chips = activeChips(filters);

  return (
    <div className="sticky top-16 z-30 border-b border-moss/15 bg-bone md:top-20">
      <div className="mx-auto max-w-7xl px-6 py-4 md:px-10">
        <div className="hidden flex-wrap items-center gap-3 md:flex">
          <Fields filters={filters} onChange={onChange} />
          {chips.length > 0 && (
            <button type="button" onClick={onClear} className="font-mono text-xs text-moss underline underline-offset-2">
              Clear filters
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 rounded border border-moss/25 px-4 py-2 font-mono text-xs uppercase tracking-wide text-forest md:hidden"
        >
          <SlidersHorizontal size={14} />
          Filters
          {chips.length > 0 && <span className="rounded-full bg-forest px-1.5 py-0.5 text-[10px] text-cream">{chips.length}</span>}
        </button>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => onChange({ [chip.key]: undefined })}
                className="flex items-center gap-1.5 rounded-full border border-moss/25 bg-bone px-3 py-1 font-mono text-[11px] text-slate hover:border-moss/50"
              >
                {chip.label}
                <X size={12} />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-forest-deep/50 md:hidden"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t bg-bone p-6 md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg tracking-tight text-forest">Filters</h2>
                <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <Fields filters={filters} onChange={onChange} />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    setSheetOpen(false);
                  }}
                  className="flex-1 rounded border border-moss/25 py-3 font-mono text-xs uppercase tracking-wide text-forest"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="flex-1 rounded-full bg-forest py-3 font-mono text-xs uppercase tracking-wide text-cream"
                >
                  Show results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

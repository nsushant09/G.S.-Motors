import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getAdminQuotes, updateAdminQuoteStatus, resolveImageUrl, ApiRequestError } from '../../lib/api';
import { formatNPR } from '../../lib/format';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useToast } from '../../components/Toast';
import type { QuoteDetail, QuoteStatus } from '../../types';

const STATUSES: QuoteStatus[] = ['new', 'contacted', 'quoted', 'closed'];

export function AdminQuotes() {
  usePageMeta('Admin — Quotes', 'Manage sell-your-car quote requests.');
  const { showToast } = useToast();
  const [quotes, setQuotes] = useState<QuoteDetail[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | ''>('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setQuotes(null);
    getAdminQuotes(statusFilter || undefined)
      .then(setQuotes)
      .catch(() => setQuotes([]));
  }, [statusFilter]);

  const onStatusChange = async (refCode: string, status: QuoteStatus) => {
    setUpdating(refCode);
    try {
      const updated = await updateAdminQuoteStatus(refCode, status);
      setQuotes((prev) => prev?.map((q) => (q.refCode === refCode ? updated : q)) ?? null);
      showToast('Status updated');
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Failed to update', 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-tight text-forest">Quotes</h1>
          <p className="mt-1 font-mono text-xs text-slate/60">{quotes ? `${quotes.length} total` : 'Loading…'}</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | '')}
          className="rounded border border-moss/25 bg-bone px-3 py-2 font-mono text-xs text-slate"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {quotes === null && <p className="text-slate/60">Loading&hellip;</p>}
        {quotes?.length === 0 && (
          <p className="text-slate/60">No quote requests{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
        )}
        {quotes?.map((q) => {
          const isOpen = expanded === q.refCode;
          return (
            <div key={q.refCode} className="rounded border border-moss/15 bg-white">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : q.refCode)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
              >
                <div>
                  <p className="font-mono text-xs text-moss">{q.refCode}</p>
                  <p className="mt-0.5 font-medium text-forest">
                    {q.vehicle.year} {q.vehicle.make} {q.vehicle.model}
                  </p>
                  <p className="mt-0.5 text-xs text-slate/60">
                    {q.owner.name} &middot; {q.owner.phone} &middot; {q.owner.city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={q.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onStatusChange(q.refCode, e.target.value as QuoteStatus)}
                    disabled={updating === q.refCode}
                    className="rounded border border-moss/25 bg-bone px-2 py-1.5 font-mono text-[11px] uppercase text-slate"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {isOpen ? <ChevronUp size={16} className="text-moss" /> : <ChevronDown size={16} className="text-moss" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-moss/10 px-4 py-4">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wide text-slate/50">Owner</p>
                      <p className="mt-1 text-sm text-slate">{q.owner.name}</p>
                      <p className="text-sm text-slate">{q.owner.phone}</p>
                      {q.owner.email && <p className="text-sm text-slate">{q.owner.email}</p>}
                      <p className="text-sm text-slate">{q.owner.city}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wide text-slate/50">Vehicle</p>
                      <p className="mt-1 text-sm text-slate">
                        {q.vehicle.kmDriven.toLocaleString('en-US')} km &middot; {q.vehicle.fuel} &middot; {q.vehicle.transmission}
                      </p>
                      <p className="text-sm text-slate">
                        Ownership: {q.vehicle.ownership} &middot; Condition: {q.vehicle.condition}
                      </p>
                      {q.vehicle.expectedPriceNPR && <p className="text-sm text-slate">Expects: {formatNPR(q.vehicle.expectedPriceNPR)}</p>}
                      {q.vehicle.notes && <p className="mt-1 text-sm italic text-slate/70">&ldquo;{q.vehicle.notes}&rdquo;</p>}
                    </div>
                  </div>
                  {q.images.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto">
                      {q.images.map((src) => (
                        <a key={src} href={resolveImageUrl(src)} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          <img src={resolveImageUrl(src)} alt="" className="h-20 w-28 rounded border border-moss/20 object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="mt-4 font-mono text-[11px] text-slate/40">
                    Submitted {new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

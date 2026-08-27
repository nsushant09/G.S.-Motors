import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { getAdminCars, deleteAdminCar, ApiRequestError } from '../../lib/api';
import { formatKm, formatNPR } from '../../lib/format';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useToast } from '../../components/Toast';
import type { Car } from '../../types';

export function AdminCars() {
  usePageMeta('Admin — Cars', 'Manage car listings.');
  const { showToast } = useToast();
  const [cars, setCars] = useState<Car[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    getAdminCars()
      .then(setCars)
      .catch(() => setCars([]));
  };

  useEffect(load, []);

  const onDelete = async (car: Car) => {
    if (!window.confirm(`Delete ${car.year} ${car.make} ${car.model}? This can't be undone.`)) return;
    setDeletingId(car._id);
    try {
      await deleteAdminCar(car._id);
      setCars((prev) => prev?.filter((c) => c._id !== car._id) ?? null);
      showToast('Car deleted');
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Failed to delete', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight text-forest">Cars</h1>
          <p className="mt-1 font-mono text-xs text-slate/60">{cars ? `${cars.length} total` : 'Loading…'}</p>
        </div>
        <Link
          to="/admin/cars/new"
          className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          <Plus size={16} /> Add car
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded border border-moss/15 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-moss/15 bg-moss/5 font-mono text-xs uppercase tracking-wide text-slate/60">
              <th className="px-4 py-3">Car</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">KM</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {cars === null && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate/60">
                  Loading&hellip;
                </td>
              </tr>
            )}
            {cars?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate/60">
                  No cars yet.
                </td>
              </tr>
            )}
            {cars?.map((car) => (
              <tr key={car._id} className="border-b border-moss/10 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-forest">
                    {car.year} {car.make} {car.model}
                  </p>
                  <p className="font-mono text-xs text-slate/50">
                    {car.bodyType} &middot; {car.fuel} &middot; {car.transmission}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono">{formatNPR(car.priceNPR)}</td>
                <td className="px-4 py-3 font-mono">{formatKm(car.kmDriven)}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-moss/10 px-2 py-1 font-mono text-[11px] uppercase text-slate">{car.status}</span>
                </td>
                <td className="px-4 py-3">{car.featured ? 'Yes' : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/admin/cars/${car._id}/edit`} aria-label="Edit" className="text-moss hover:text-forest">
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(car)}
                      disabled={deletingId === car._id}
                      aria-label="Delete"
                      className="text-moss hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

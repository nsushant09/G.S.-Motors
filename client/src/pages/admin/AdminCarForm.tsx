import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { Combobox } from '../../components/admin/Combobox';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useToast } from '../../components/Toast';
import {
  createAdminCar,
  getAdminCar,
  getMakes,
  resolveImageUrl,
  updateAdminCar,
  uploadAdminCarPhotos,
  ApiRequestError,
} from '../../lib/api';
import { BODY_TYPES, FUEL_TYPES, PROVINCES, TRANSMISSIONS } from '../../lib/constants';
import type { CarInput } from '../../types';

const currentYear = new Date().getFullYear();

const optionalPositiveInt = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
  z.number().int().positive('Number must be greater than 0').optional()
);

const schema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  variant: z.string().trim().optional(),
  year: z.coerce.number().int().min(1980, 'Enter a valid year').max(currentYear + 1, 'Enter a valid year'),
  priceNPR: z.coerce.number().int().nonnegative('Enter a valid price'),
  negotiable: z.boolean(),
  kmDriven: z.coerce.number().int().nonnegative('Enter kilometres driven'),
  fuel: z.string().trim().min(1, 'Fuel is required'),
  transmission: z.string().trim().min(1, 'Transmission is required'),
  bodyType: z.string().trim().min(1, 'Body type is required'),
  ownership: z.coerce.number().int().positive('Enter number of owners'),
  registrationProvince: z.string().trim().min(1, 'Province is required'),
  numberPlateZone: z.string().trim().optional(),
  color: z.string().trim().min(1, 'Colour is required'),
  seats: optionalPositiveInt,
  engineCC: optionalPositiveInt,
  description: z.string().trim().min(1, 'Description is required'),
  status: z.enum(['available', 'reserved', 'sold']),
  featured: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const inputClass = 'w-full rounded border border-moss/25 bg-bone px-4 py-2.5 text-sm text-slate focus:border-moss';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate/70">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

export function AdminCarForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  usePageMeta(isEdit ? 'Admin — Edit car' : 'Admin — Add car', 'Create or edit a car listing.');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [makes, setMakes] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      negotiable: false,
      featured: false,
      status: 'available',
      ownership: 1,
    },
  });

  useEffect(() => {
    getMakes().then(setMakes).catch(() => setMakes([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    getAdminCar(id)
      .then((car) => {
        reset({
          make: car.make,
          model: car.model,
          variant: car.variant ?? '',
          year: car.year,
          priceNPR: car.priceNPR,
          negotiable: car.negotiable,
          kmDriven: car.kmDriven,
          fuel: car.fuel,
          transmission: car.transmission,
          bodyType: car.bodyType,
          ownership: car.ownership,
          registrationProvince: car.registrationProvince,
          numberPlateZone: car.numberPlateZone ?? '',
          color: car.color,
          seats: car.seats,
          engineCC: car.engineCC,
          description: car.description,
          status: car.status,
          featured: car.featured,
        });
        setHighlights(car.highlights);
        setImages(car.images);
      })
      .catch(() => showToast('Could not load that car', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadAdminCarPhotos(Array.from(files));
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const payload: CarInput = {
      ...values,
      highlights: highlights.map((h) => h.trim()).filter(Boolean),
      images,
    };
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateAdminCar(id, payload);
        showToast('Car updated');
      } else {
        await createAdminCar(payload);
        showToast('Car created');
      }
      navigate('/admin/cars');
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="px-6 py-8 text-slate">Loading&hellip;</div>;
  }

  return (
    <div className="px-6 py-8 md:px-10">
      <h1 className="font-display text-2xl tracking-tight text-forest">{isEdit ? 'Edit car' : 'Add car'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-3xl space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Make" error={errors.make?.message}>
            <Controller
              name="make"
              control={control}
              render={({ field }) => <Combobox value={field.value ?? ''} onChange={field.onChange} options={makes.length ? makes : []} placeholder="Toyota" className={inputClass} />}
            />
          </Field>
          <Field label="Model" error={errors.model?.message}>
            <input {...register('model')} className={inputClass} placeholder="Corolla" />
          </Field>
          <Field label="Variant (optional)" error={errors.variant?.message}>
            <input {...register('variant')} className={inputClass} placeholder="Altis" />
          </Field>
          <Field label="Year" error={errors.year?.message}>
            <input type="number" {...register('year')} className={inputClass} />
          </Field>
          <Field label="Price, NPR" error={errors.priceNPR?.message}>
            <input type="number" {...register('priceNPR')} className={inputClass} />
          </Field>
          <Field label="Kilometres driven" error={errors.kmDriven?.message}>
            <input type="number" {...register('kmDriven')} className={inputClass} />
          </Field>
          <Field label="Fuel" error={errors.fuel?.message}>
            <Controller
              name="fuel"
              control={control}
              render={({ field }) => <Combobox value={field.value ?? ''} onChange={field.onChange} options={FUEL_TYPES} placeholder="Petrol" className={inputClass} />}
            />
          </Field>
          <Field label="Transmission" error={errors.transmission?.message}>
            <Controller
              name="transmission"
              control={control}
              render={({ field }) => (
                <Combobox value={field.value ?? ''} onChange={field.onChange} options={TRANSMISSIONS} placeholder="Manual" className={inputClass} />
              )}
            />
          </Field>
          <Field label="Body type" error={errors.bodyType?.message}>
            <Controller
              name="bodyType"
              control={control}
              render={({ field }) => <Combobox value={field.value ?? ''} onChange={field.onChange} options={BODY_TYPES} placeholder="Sedan" className={inputClass} />}
            />
          </Field>
          <Field label="Ownership (number of owners)" error={errors.ownership?.message}>
            <input type="number" {...register('ownership')} className={inputClass} />
          </Field>
          <Field label="Registration province" error={errors.registrationProvince?.message}>
            <Controller
              name="registrationProvince"
              control={control}
              render={({ field }) => (
                <Combobox value={field.value ?? ''} onChange={field.onChange} options={PROVINCES} placeholder="Bagmati" className={inputClass} />
              )}
            />
          </Field>
          <Field label="Number plate (partial, optional)" error={errors.numberPlateZone?.message}>
            <input {...register('numberPlateZone')} className={inputClass} placeholder="Ba 2 Cha" />
          </Field>
          <Field label="Colour" error={errors.color?.message}>
            <input {...register('color')} className={inputClass} placeholder="Silver" />
          </Field>
          <Field label="Seats (optional)" error={errors.seats?.message}>
            <input type="number" {...register('seats')} className={inputClass} />
          </Field>
          <Field label="Engine CC (optional)" error={errors.engineCC?.message}>
            <input type="number" {...register('engineCC')} className={inputClass} />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <select {...register('status')} className={inputClass}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate">
            <input type="checkbox" {...register('negotiable')} className="h-4 w-4" />
            Negotiable
          </label>
          <label className="flex items-center gap-2 text-sm text-slate">
            <input type="checkbox" {...register('featured')} className="h-4 w-4" />
            Featured on homepage
          </label>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <textarea {...register('description')} rows={4} className={inputClass} />
        </Field>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-slate/70">Highlights</span>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={h}
                  onChange={(e) => setHighlights((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                  className={inputClass}
                  placeholder="Single owner"
                />
                <button
                  type="button"
                  onClick={() => setHighlights((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove highlight"
                  className="shrink-0 text-moss hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setHighlights((prev) => [...prev, ''])}
            className="mt-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-moss"
          >
            <Plus size={14} /> Add highlight
          </button>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-slate/70">Photos</span>
          {images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((src, i) => (
                <div key={src} className="relative overflow-hidden rounded border border-moss/20 bg-forest-deep">
                  <img src={resolveImageUrl(src)} alt="" className="aspect-[4/3] w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-forest-deep/90 px-1.5 py-0.5 font-mono text-[9px] uppercase text-cream">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest-deep/90 text-cream"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded border border-dashed border-moss/30 px-4 py-2.5 text-sm text-moss disabled:opacity-50"
          >
            <UploadCloud size={16} />
            {uploading ? 'Uploading…' : 'Upload photos'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              onUploadFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        <div className="flex gap-3 border-t border-moss/15 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/cars')}
            className="rounded-full border border-moss/30 px-6 py-3 text-sm font-medium text-forest"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create car'}
          </button>
        </div>
      </form>
    </div>
  );
}

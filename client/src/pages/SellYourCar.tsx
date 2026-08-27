import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Copy } from 'lucide-react';
import { ImageDropzone } from '../components/ImageDropzone';
import { usePageMeta } from '../hooks/usePageMeta';
import { useToast } from '../components/Toast';
import { submitQuote, ApiRequestError } from '../lib/api';
import { FUEL_TYPES, TRANSMISSIONS } from '../lib/constants';

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs work'] as const;
const currentYear = new Date().getFullYear();

const optionalNumber = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
  z.number().nonnegative('Enter a positive number').optional()
);

const schema = z.object({
  make: z.string().trim().min(1, 'Enter the make'),
  model: z.string().trim().min(1, 'Enter the model'),
  year: z.coerce.number().int().min(1980, 'Enter a valid year').max(currentYear + 1, 'Enter a valid year'),
  kmDriven: z.coerce.number().int().nonnegative('Enter kilometres driven'),
  fuel: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']),
  transmission: z.enum(['Manual', 'Automatic']),
  ownership: z.coerce.number().int().positive('Enter number of owners'),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Needs work']),
  name: z.string().trim().min(2, 'Enter your full name'),
  phone: z.string().regex(/^9[678]\d{8}$/, 'Enter a valid Nepali mobile number (e.g. 98XXXXXXXX)'),
  city: z.string().trim().min(2, 'Enter your city'),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  expectedPriceNPR: optionalNumber,
  notes: z.string().trim().max(500, 'Keep it under 500 characters').optional(),
});

type FormValues = z.infer<typeof schema>;

const STEP_FIELDS: (keyof FormValues)[][] = [
  ['make', 'model', 'year', 'kmDriven', 'fuel', 'transmission', 'ownership', 'condition'],
  [],
  ['name', 'phone', 'city', 'email', 'expectedPriceNPR', 'notes'],
];

const STEPS = ['Your vehicle', 'Photos', 'Your details'];

const inputClass = 'w-full rounded border border-moss/25 bg-bone px-4 py-2.5 text-sm text-slate focus:border-moss';

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate/70">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

export function SellYourCar() {
  usePageMeta('Sell your car', 'Get a fair quotation for your car in one working day.');
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imagesError, setImagesError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { fuel: 'Petrol', transmission: 'Manual', condition: 'Good', ownership: 1 },
  });

  const goNext = async () => {
    if (step === 1) {
      if (images.length === 0) {
        setImagesError('Add at least one photo');
        return;
      }
      setImagesError(undefined);
      setStep(2);
      return;
    }
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = async (values: FormValues) => {
    if (images.length === 0) {
      setStep(1);
      setImagesError('Add at least one photo');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitQuote(values, images);
      setRefCode(res.refCode);
    } catch (err) {
      setSubmitError(err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRefCode = () => {
    if (!refCode) return;
    navigator.clipboard
      .writeText(refCode)
      .then(() => {
        setCopied(true);
        showToast('Reference code copied');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => showToast("Couldn't copy — select the code manually", 'error'));
  };

  if (refCode) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/10 text-moss">
          <Check size={28} />
        </div>
        <h1 className="mt-6 font-display text-2xl tracking-tight text-forest md:text-3xl">Details sent.</h1>
        <p className="mt-2 text-slate">We&apos;ll call you within one working day.</p>
        <div className="mt-8 flex items-center gap-3 rounded border border-moss/25 px-6 py-4">
          <span className="font-mono text-2xl tracking-widest text-forest">{refCode}</span>
          <button type="button" onClick={copyRefCode} aria-label="Copy reference code" className="text-moss transition-colors hover:text-forest">
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        <p className="mt-3 font-mono text-xs text-slate/60">Save this reference code to check your quote&apos;s status.</p>
        <Link to="/" className="mt-10 rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep">
          Back to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-20 pt-24 md:pt-32">
      <h1 className="font-display text-3xl tracking-tight text-forest md:text-4xl">Sell your car</h1>
      <p className="mt-2 text-sm text-slate">Three short steps. We&apos;ll call you within one working day.</p>

      <div className="mt-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                i <= step ? 'bg-forest text-cream' : 'bg-moss/10 text-slate/50'
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`hidden text-xs font-medium sm:inline ${i <= step ? 'text-forest' : 'text-slate/50'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-forest' : 'bg-moss/15'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Make" error={errors.make?.message}>
              <input {...register('make')} className={inputClass} placeholder="Toyota" />
            </Field>
            <Field label="Model" error={errors.model?.message}>
              <input {...register('model')} className={inputClass} placeholder="Corolla" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Year" error={errors.year?.message}>
                <input type="number" {...register('year')} className={inputClass} placeholder="2018" />
              </Field>
              <Field label="Kilometres driven" error={errors.kmDriven?.message}>
                <input type="number" {...register('kmDriven')} className={inputClass} placeholder="45000" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fuel" error={errors.fuel?.message}>
                <select {...register('fuel')} className={inputClass}>
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Transmission" error={errors.transmission?.message}>
                <select {...register('transmission')} className={inputClass}>
                  {TRANSMISSIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ownership (number of owners)" error={errors.ownership?.message}>
                <input type="number" {...register('ownership')} className={inputClass} placeholder="1" />
              </Field>
              <Field label="Condition" error={errors.condition?.message}>
                <select {...register('condition')} className={inputClass}>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="mb-4 text-sm text-slate">
              Add 1&ndash;6 photos. We compress them before uploading, so mobile data is fine.
            </p>
            <ImageDropzone
              onChange={(files) => {
                setImages(files);
                if (files.length > 0) setImagesError(undefined);
              }}
              error={imagesError}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Full name" error={errors.name?.message}>
              <input {...register('name')} className={inputClass} placeholder="Your name" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" error={errors.phone?.message}>
                <input {...register('phone')} className={inputClass} placeholder="98XXXXXXXX" />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <input {...register('city')} className={inputClass} placeholder="Kathmandu" />
              </Field>
            </div>
            <Field label="Email (optional)" error={errors.email?.message}>
              <input type="email" {...register('email')} className={inputClass} placeholder="you@example.com" />
            </Field>
            <Field label="Expected price, NPR (optional)" error={errors.expectedPriceNPR?.message}>
              <input type="number" {...register('expectedPriceNPR')} className={inputClass} placeholder="2500000" />
            </Field>
            <Field label="Notes (optional)" error={errors.notes?.message}>
              <textarea {...register('notes')} rows={3} className={inputClass} placeholder="Anything else we should know" />
            </Field>

            {submitError && <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-moss/30 px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-moss/5"
            >
              Back
            </button>
          )}
          {step < 2 && (
            <button
              type="button"
              onClick={goNext}
              className="ml-auto rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              Continue
            </button>
          )}
          {step === 2 && (
            <button
              type="submit"
              disabled={submitting}
              className="ml-auto rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send my details'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

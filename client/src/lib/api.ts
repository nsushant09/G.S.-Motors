import type {
  ApiError,
  Car,
  CarInput,
  CarListResponse,
  GalleryImage,
  QuoteDetail,
  QuoteFormValues,
  QuoteResponse,
  QuoteStatus,
} from '../types';
import { getAdminToken } from './adminAuth';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

/**
 * Seed placeholder images live under client/public/cars (same origin as the
 * client). Real uploads (quote photos, admin-added car photos) are served by
 * the API under /uploads. Resolve accordingly so both render correctly.
 */
export function resolveImageUrl(src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  if (src.startsWith('/uploads/')) return `${API_ORIGIN}${src}`;
  return src;
}

export class ApiRequestError extends Error {
  code: string;
  fields?: Record<string, string>;

  constructor(message: string, code: string, fields?: Record<string, string>) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    let body: ApiError | undefined;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    const err = body?.error;
    throw new ApiRequestError(err?.message ?? 'Something went wrong', err?.code ?? 'UNKNOWN_ERROR', err?.fields);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return request<T>(path, { ...init, headers });
}

export interface CarsQueryParams {
  make?: string;
  bodyType?: string;
  fuel?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  maxKm?: number;
  q?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'km_asc';
  page?: number;
  limit?: number;
}

export function getCars(params: CarsQueryParams = {}): Promise<CarListResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const qs = query.toString();
  return request<CarListResponse>(`/cars${qs ? `?${qs}` : ''}`);
}

export async function getCar(slug: string): Promise<Car> {
  const res = await request<{ data: Car }>(`/cars/${slug}`);
  return res.data;
}

export async function getFeaturedCars(): Promise<Car[]> {
  const res = await request<{ data: Car[] }>('/cars/featured');
  return res.data;
}

export async function getGallery(): Promise<GalleryImage[]> {
  const res = await request<{ data: GalleryImage[] }>('/gallery');
  return res.data;
}

export async function submitQuote(values: QuoteFormValues, images: File[]): Promise<QuoteResponse> {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') form.append(key, String(value));
  });
  images.forEach((file) => form.append('images', file));

  const res = await request<{ data: QuoteResponse }>('/quotes', { method: 'POST', body: form });
  return res.data;
}

export async function getQuoteStatus(refCode: string): Promise<QuoteResponse & { createdAt: string }> {
  const res = await request<{ data: QuoteResponse & { createdAt: string } }>(`/quotes/${refCode}`);
  return res.data;
}

export async function getMakes(): Promise<string[]> {
  const res = await request<{ data: string[] }>('/cars/makes');
  return res.data;
}

// ---- Admin ----

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await request<{ data: { token: string } }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.data.token;
}

export async function getAdminCars(): Promise<Car[]> {
  const res = await adminRequest<{ data: Car[] }>('/admin/cars');
  return res.data;
}

export async function getAdminCar(id: string): Promise<Car> {
  const res = await adminRequest<{ data: Car }>(`/admin/cars/${id}`);
  return res.data;
}

export async function createAdminCar(input: CarInput): Promise<Car> {
  const res = await adminRequest<{ data: Car }>('/admin/cars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function updateAdminCar(id: string, input: CarInput): Promise<Car> {
  const res = await adminRequest<{ data: Car }>(`/admin/cars/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function deleteAdminCar(id: string): Promise<void> {
  await adminRequest<void>(`/admin/cars/${id}`, { method: 'DELETE' });
}

export async function uploadAdminCarPhotos(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));
  const res = await adminRequest<{ data: { urls: string[] } }>('/admin/uploads', { method: 'POST', body: form });
  return res.data.urls;
}

export async function getAdminQuotes(status?: QuoteStatus): Promise<QuoteDetail[]> {
  const qs = status ? `?status=${status}` : '';
  const res = await adminRequest<{ data: QuoteDetail[] }>(`/admin/quotes${qs}`);
  return res.data;
}

export async function updateAdminQuoteStatus(refCode: string, status: QuoteStatus): Promise<QuoteDetail> {
  const res = await adminRequest<{ data: QuoteDetail }>(`/admin/quotes/${refCode}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.data;
}

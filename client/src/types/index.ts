// Sell-your-car form intake: fixed, common categories for a private seller.
export type Fuel = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
export type Transmission = 'Manual' | 'Automatic';
export type CarStatus = 'available' | 'reserved' | 'sold';

// Listings: make/fuel/transmission/bodyType are open text — the admin
// dashboard can add new ones, so these are plain strings, not closed unions.
export interface Car {
  _id: string;
  slug: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  priceNPR: number;
  negotiable: boolean;
  kmDriven: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  ownership: number;
  registrationProvince: string;
  numberPlateZone?: string;
  color: string;
  seats?: number;
  engineCC?: number;
  description: string;
  highlights: string[];
  images: string[];
  status: CarStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CarListResponse {
  data: Car[];
  meta: ListMeta;
}

export interface GalleryImage {
  src: string;
  slug: string;
  alt: string;
  bodyType: string;
}

export type QuoteCondition = 'Excellent' | 'Good' | 'Fair' | 'Needs work';

export interface QuoteFormValues {
  make: string;
  model: string;
  year: number;
  kmDriven: number;
  fuel: Fuel;
  transmission: Transmission;
  ownership: number;
  condition: QuoteCondition;
  name: string;
  phone: string;
  city: string;
  email?: string;
  expectedPriceNPR?: number;
  notes?: string;
}

export interface QuoteResponse {
  refCode: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

/** Full car payload for admin create/update — everything except server-assigned fields. */
export interface CarInput {
  make: string;
  model: string;
  variant?: string;
  year: number;
  priceNPR: number;
  negotiable: boolean;
  kmDriven: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  ownership: number;
  registrationProvince: string;
  numberPlateZone?: string;
  color: string;
  seats?: number;
  engineCC?: number;
  description: string;
  highlights: string[];
  images: string[];
  status: CarStatus;
  featured: boolean;
}

export type QuoteStatus = 'new' | 'contacted' | 'quoted' | 'closed';

export interface QuoteDetail {
  _id: string;
  refCode: string;
  owner: { name: string; phone: string; email?: string; city: string };
  vehicle: {
    make: string;
    model: string;
    year: number;
    kmDriven: number;
    fuel: string;
    transmission: string;
    ownership: number;
    condition: QuoteCondition;
    expectedPriceNPR?: number;
    notes?: string;
  };
  images: string[];
  status: QuoteStatus;
  createdAt: string;
}

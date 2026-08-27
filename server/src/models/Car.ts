import { Schema, model, Document } from 'mongoose';

// Make, fuel, transmission and body type are open-ended free text — the admin
// dashboard can add new ones on the fly. The constants lists (client + seed)
// are suggestions, not a closed set enforced here.
export type CarStatus = 'available' | 'reserved' | 'sold';

export interface ICar extends Omit<Document, 'model'> {
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
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICar>(
  {
    slug: { type: String, required: true, unique: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    variant: { type: String },
    year: { type: Number, required: true },
    priceNPR: { type: Number, required: true },
    negotiable: { type: Boolean, default: false },
    kmDriven: { type: Number, required: true },
    fuel: { type: String, required: true },
    transmission: { type: String, required: true },
    bodyType: { type: String, required: true },
    ownership: { type: Number, required: true },
    registrationProvince: { type: String, required: true },
    numberPlateZone: { type: String },
    color: { type: String, required: true },
    seats: { type: Number },
    engineCC: { type: Number },
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

carSchema.index({ status: 1, createdAt: -1 });
carSchema.index({ make: 'text', model: 'text', variant: 'text' });

export const Car = model<ICar>('Car', carSchema);

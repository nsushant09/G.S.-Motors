import { Schema, model, Document } from 'mongoose';

export type QuoteStatus = 'new' | 'contacted' | 'quoted' | 'closed';
export type Condition = 'Excellent' | 'Good' | 'Fair' | 'Needs work';

export interface IQuoteRequest extends Document {
  refCode: string;
  owner: {
    name: string;
    phone: string;
    email?: string;
    city: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    kmDriven: number;
    fuel: string;
    transmission: string;
    ownership: number;
    condition: Condition;
    expectedPriceNPR?: number;
    notes?: string;
  };
  images: string[];
  status: QuoteStatus;
  createdAt: Date;
}

const quoteRequestSchema = new Schema<IQuoteRequest>(
  {
    refCode: { type: String, required: true, unique: true },
    owner: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      city: { type: String, required: true },
    },
    vehicle: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      kmDriven: { type: Number, required: true },
      fuel: { type: String, required: true },
      transmission: { type: String, required: true },
      ownership: { type: Number, required: true },
      condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Needs work'], required: true },
      expectedPriceNPR: { type: Number },
      notes: { type: String },
    },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['new', 'contacted', 'quoted', 'closed'], default: 'new' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const QuoteRequest = model<IQuoteRequest>('QuoteRequest', quoteRequestSchema);

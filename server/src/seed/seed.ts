import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Car } from '../models/Car';
import { QuoteRequest } from '../models/QuoteRequest';
import carsSeed from './cars.seed.json';

const sampleQuotes = [
  {
    refCode: 'GSQ-4X7K2',
    owner: { name: 'Rajesh Shrestha', phone: '9841122334', email: 'rajesh.shrestha@example.com', city: 'Lalitpur' },
    vehicle: {
      make: 'Toyota',
      model: 'Vitz',
      year: 2014,
      kmDriven: 87000,
      fuel: 'Petrol',
      transmission: 'Automatic',
      ownership: 2,
      condition: 'Good',
      expectedPriceNPR: 2100000,
      notes: 'Single small dent on the rear bumper, otherwise well maintained.',
    },
    images: ['/uploads/GSQ-4X7K2-1-sample01.jpg'],
    status: 'new',
  },
  {
    refCode: 'GSQ-9M3PQ',
    owner: { name: 'Sunita Gurung', phone: '9860011223', city: 'Pokhara' },
    vehicle: {
      make: 'Hyundai',
      model: 'Santro',
      year: 2016,
      kmDriven: 62000,
      fuel: 'Petrol',
      transmission: 'Manual',
      ownership: 1,
      condition: 'Excellent',
      expectedPriceNPR: 1950000,
    },
    images: ['/uploads/GSQ-9M3PQ-1-sample01.jpg', '/uploads/GSQ-9M3PQ-2-sample02.jpg'],
    status: 'contacted',
  },
  {
    refCode: 'GSQ-2T8YB',
    owner: { name: 'Bikash Tamang', phone: '9779934455', city: 'Bhaktapur' },
    vehicle: {
      make: 'Mahindra',
      model: 'XUV500',
      year: 2015,
      kmDriven: 110000,
      fuel: 'Diesel',
      transmission: 'Manual',
      ownership: 2,
      condition: 'Fair',
      notes: 'Needs new tyres soon, mechanically sound.',
    },
    images: ['/uploads/GSQ-2T8YB-1-sample01.jpg'],
    status: 'quoted',
  },
];

async function seed() {
  const reset = process.argv.includes('--reset');

  await connectDB();

  if (reset) {
    await Car.deleteMany({});
    await QuoteRequest.deleteMany({});
    console.log('Cleared existing cars and quote requests.');
  }

  for (const car of carsSeed) {
    await Car.findOneAndUpdate({ slug: car.slug }, car, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Upserted ${carsSeed.length} cars.`);

  for (const quote of sampleQuotes) {
    await QuoteRequest.findOneAndUpdate({ refCode: quote.refCode }, quote, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  console.log(`Upserted ${sampleQuotes.length} sample quote requests.`);

  await mongoose.connection.close();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

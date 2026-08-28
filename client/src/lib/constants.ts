export const BUSINESS = {
  phone: '+97715224133',
  phoneDisplay: '01-5224133',
  whatsappLink: 'https://wa.me/9779851310685',
  whatsappDisplay: '9851310685',
  email: 'gsmotorsprivatelimited@gmail.com',
  address: 'Karkhana Chowk, Swoyambhu, Kathmandu, Nepal',
  hours: 'Everyday, 7:00 AM – 7:00 PM',
  carsSold: 1000,
  yearsInBusiness: 5,
  provincesServed: 7,
};

export const LOCATION = {
  lat: 27.7140902,
  lng: 85.2829039,
  mapsLink: 'https://maps.app.goo.gl/jpfuALnksQJ6RFrr9',
  get embedSrc() {
    return `https://www.google.com/maps?q=${this.lat},${this.lng}&z=16&output=embed`;
  },
};

export const NAV_LINKS = [
  { label: 'Listings', to: '/listings' },
  { label: 'Sell your car', to: '/sell' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
];

export const BODY_TYPES = ['Hatchback', 'Sedan', 'SUV', 'Pickup', 'Van', 'Jeep', 'Motorcycle', 'Scooter'] as const;
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'] as const;
export const TRANSMISSIONS = ['Manual', 'Automatic'] as const;
export const MAKES = ['Toyota', 'Suzuki', 'Maruti Suzuki', 'Hyundai', 'Mahindra', 'Ford', 'Kia', 'BYD', 'Honda'] as const;
export const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'] as const;
export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'km_asc', label: 'Kilometres: low to high' },
];

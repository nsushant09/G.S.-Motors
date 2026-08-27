# GS Motors — Website Technical Specification

## 0. Read this first

Before writing any code:

1. Read the existing `docker-compose.yaml` in the repo root. It already defines part of the backend. **Reuse it. Do not rewrite it from scratch.** Extend it only where a service is missing.
2. Report back what services, ports, env vars, volumes and network names it already declares, and map them to the sections below before you start.
3. If something in this spec conflicts with what is already in `docker-compose.yaml`, the existing file wins for infrastructure (ports, service names, credentials). Tell me about the conflict instead of silently changing it.

Work in small commits. Backend first, then seed data, then frontend.

---

## 1. What we are building

GS Motors is a second-hand vehicle dealership in Nepal. The site has one job: make a buyer trust us enough to call about a specific car.

Four things it must do:

1. A landing page with a moving hero.
2. Show the cars we currently have, priced in NPR.
3. Let a customer submit their own car (with photos) to get a quotation from us.
4. A gallery of our cars.

Audience: Nepali buyers and sellers, mostly on phones, often on slow connections. Build mobile-first and keep the page weight down.

---

## 2. Stack

- **MongoDB** — data store
- **Express** (Node 20 LTS) — REST API
- **React 18 + TypeScript** — frontend, built with Vite
- **Node.js** — runtime
- **Tailwind CSS** — styling
- **Framer Motion** — animation
- **Lucide React** — icons
- **Docker Compose** — local orchestration

No CSS-in-JS libraries. No component library (no MUI, no shadcn). Write the components.

### Repo layout

```
/
├── docker-compose.yaml        # already exists — extend, don't replace
├── .env.example
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/db.ts
│   │   ├── models/          Car.ts, QuoteRequest.ts
│   │   ├── routes/          cars.ts, quotes.ts, health.ts
│   │   ├── controllers/
│   │   ├── middleware/      errorHandler.ts, upload.ts, rateLimit.ts
│   │   ├── seed/            seed.ts, cars.seed.json
│   │   └── utils/
│   ├── uploads/             # bind-mounted volume for quote images
│   ├── Dockerfile
│   └── package.json
└── client/
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── pages/           Home.tsx, Listings.tsx, CarDetail.tsx, SellYourCar.tsx, Gallery.tsx, About.tsx, NotFound.tsx
    │   ├── components/      Nav, Footer, HeroMotion, CarCard, FilterBar, Odometer, ImageDropzone, Toast, Skeleton
    │   ├── hooks/           useCars.ts, useReducedMotion.ts
    │   ├── lib/             api.ts, format.ts
    │   ├── types/           index.ts
    │   └── styles/index.css
    ├── public/              logo_light.png, logo_dark.png, favicon
    ├── Dockerfile
    └── package.json
```

---

## 3. Docker Compose

Expected final service set. Check which of these already exist before adding anything.

| Service | Image / build | Port | Notes |
|---|---|---|---|
| `mongo` | `mongo:7` | 27017 | named volume `mongo_data` for persistence |
| `server` | build `./server` | 5000 | depends_on mongo; bind-mount `./server/uploads` |
| `client` | build `./client` | 5173 | Vite dev server, HMR enabled |

Requirements:

- Both `server` and `client` mount source as volumes in dev so hot reload works. Anonymous volume on `node_modules` so the host folder doesn't shadow the container's.
- All services on one user-defined bridge network.
- `mongo` gets a healthcheck; `server` waits on it with `condition: service_healthy`.
- No secrets committed. Everything through `.env`, with a checked-in `.env.example`.

### Env vars

```
# server
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://mongo:27017/gsmotors
CLIENT_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=5

# client
VITE_API_URL=http://localhost:5000/api
```

### Commands that must work

```bash
docker compose up --build          # whole stack
docker compose exec server npm run seed        # load seed data
docker compose exec server npm run seed:reset  # wipe + reload
```

---

## 4. Data models

### Car

```ts
{
  _id: ObjectId,
  slug: string,            // "2018-toyota-hilux-revo-4x4" — unique, indexed
  make: string,            // "Toyota"
  model: string,           // "Hilux Revo"
  variant?: string,        // "4x4 G"
  year: number,            // 2018
  priceNPR: number,        // 8450000 — store as integer, no decimals, no formatting
  negotiable: boolean,
  kmDriven: number,        // 46000
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG',
  transmission: 'Manual' | 'Automatic',
  bodyType: 'Hatchback' | 'Sedan' | 'SUV' | 'Pickup' | 'Van' | 'Jeep' | 'Motorcycle' | 'Scooter',
  ownership: number,       // 1 = first owner
  registrationProvince: string,   // "Bagmati"
  numberPlateZone?: string,       // "Ba 2 Cha" — partial, privacy
  color: string,
  seats?: number,
  engineCC?: number,
  description: string,     // 2–4 sentences, honest tone
  highlights: string[],    // 3–5 short bullets, e.g. "Single owner", "Service history available"
  images: string[],        // ordered; first is the card thumbnail
  status: 'available' | 'reserved' | 'sold',
  featured: boolean,
  createdAt, updatedAt
}
```

Indexes: unique on `slug`; compound on `status + createdAt`; text index on `make, model, variant`.

### QuoteRequest

```ts
{
  _id: ObjectId,
  refCode: string,         // "GSQ-4X7K2" — generated, shown to the customer
  owner: {
    name: string,
    phone: string,         // Nepali mobile, 10 digits starting 97/98
    email?: string,
    city: string
  },
  vehicle: {
    make: string,
    model: string,
    year: number,
    kmDriven: number,
    fuel: string,
    transmission: string,
    ownership: number,
    condition: 'Excellent' | 'Good' | 'Fair' | 'Needs work',
    expectedPriceNPR?: number,
    notes?: string
  },
  images: string[],        // 1–6 file paths
  status: 'new' | 'contacted' | 'quoted' | 'closed',
  createdAt
}
```

---

## 5. API

Base path `/api`. JSON everywhere. Consistent error shape:

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Phone number is not valid", "fields": { "phone": "..." } } }
```

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | returns `{ status, db }` |
| GET | `/cars` | list; query params below |
| GET | `/cars/:slug` | single car |
| GET | `/cars/featured` | 6 featured cars for the landing page |
| GET | `/gallery` | flattened image list with car slug + alt text |
| POST | `/quotes` | multipart form, creates a quote request |
| GET | `/quotes/:refCode` | status lookup by reference code |

`GET /cars` query params: `make`, `bodyType`, `fuel`, `transmission`, `minPrice`, `maxPrice`, `maxKm`, `q` (text search), `sort` (`newest` | `price_asc` | `price_desc` | `km_asc`), `page`, `limit` (default 12).

Response:

```json
{ "data": [...], "meta": { "page": 1, "limit": 12, "total": 24, "pages": 2 } }
```

**Validation:** use `zod` on every request body and query. Never trust the client.

**Uploads:** `multer`, disk storage to `server/uploads`, filename `${refCode}-${index}-${nanoid}.${ext}`. Accept `image/jpeg`, `image/png`, `image/webp` only — check the magic bytes, not just the mimetype. Max 5 MB per file, max 6 files. Serve statically from `/uploads`.

**Rate limit:** `POST /quotes` capped at 5 requests per IP per hour.

**Security:** `helmet`, CORS locked to `CLIENT_ORIGIN`, body size limit, `express-mongo-sanitize`.

---

## 6. Seed data

Write `server/src/seed/cars.seed.json` with **14 cars** and a `npm run seed` script that upserts by `slug` so it is safe to run twice.

Make the data believable for Nepal. Suggested mix:

- Toyota Hilux Revo, Toyota Corolla, Toyota Land Cruiser Prado
- Suzuki Swift, Suzuki Alto K10, Maruti Suzuki Wagon R
- Hyundai i20, Hyundai Creta
- Mahindra Scorpio, Mahindra Bolero
- Ford EcoSport
- Kia Sonet
- BYD Atto 3 (electric)
- Honda City

Rules for the seed values:

- Prices realistic for the Nepali used market, in NPR, e.g. `1850000`, `4200000`, `9500000`. Nepal has heavy vehicle duty — price accordingly, cars cost far more than in India or the US.
- `kmDriven` between 12,000 and 140,000.
- Registration provinces from the real seven: Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, Sudurpashchim. Most in Bagmati.
- Mark 3 as `featured: true`, 1 as `reserved`, 1 as `sold`.
- Descriptions written like a dealer who is not overselling. Mention real things: service history, tyre condition, single owner, minor scratches. No marketing fluff.

**Images:** do not hotlink random stock photos. Create `client/public/cars/` and reference paths like `/cars/hilux-revo-01.jpg`. Generate tasteful SVG placeholders at the right aspect ratio (16:10) with the car name on them, so the layout is correct and I can drop in real photos later by replacing the files. Name them predictably.

Also seed 3 sample `QuoteRequest` documents so the flow can be tested.

---

## 7. Design direction

### Palette

Derived from the logo: cream lettering, dark green accent.

| Token | Hex | Use |
|---|---|---|
| `forest` | `#12301F` | primary dark, hero background, footer |
| `forest-deep` | `#0A1B12` | near-black sections, overlays |
| `moss` | `#2E5E42` | secondary green, hovers, borders |
| `cream` | `#FDF8E3` | logo cream, text on dark |
| `bone` | `#F6F4EE` | light page background |
| `slate` | `#3D4440` | body text on light |

Accent used sparingly. This is a minimal site: mostly bone and forest, green as punctuation.

### Type

- **Display:** `Bricolage Grotesque` (Google Fonts) — weights 500, 700. Tight tracking, used for headings and prices only.
- **Body:** `Inter` — 400, 500, 600.
- **Utility:** `JetBrains Mono` — 400, for specs, kilometres, registration numbers, reference codes. This is the small move that makes the site feel like it's about machines.

Scale: `clamp()` based, mobile-first. Headings `tracking-tight`. Body `leading-relaxed`.

### Rules

- Border radius: `4px` on cards and inputs. Not pill-shaped, not sharp. Buttons are the exception — `rounded-full` for primary CTAs only.
- No gradients except one: a subtle forest-to-forest-deep in the hero.
- No drop shadows on cards. Use a `1px` `moss/20` border instead.
- Generous whitespace. Section padding `py-20 md:py-32`.
- Max content width `max-w-7xl`, `px-6 md:px-10`.

### The signature element

**An odometer.** A small component that rolls digits up into place. Use it for:

- prices on car cards and detail pages
- the "cars sold" / "years in business" counters
- the kilometre reading in the spec table

It ties the whole site to the subject, and it's the one thing to spend animation budget on. Everything else stays quiet.

---

## 8. Pages

### 8.1 Landing (`/`)

**Nav** — fixed, transparent over the hero, then solid `bone` with a hairline bottom border after 80px of scroll. Logo left (`logo_light.png` over hero, dark version after). Links: Listings, Sell your car, Gallery, About. Right side: a `Call us` button with the phone number. Mobile: hamburger, full-screen overlay menu with `forest` background and cream links.

**Hero — the moving part.**

Full viewport (`h-screen`, `min-h-[600px]`), `forest` background, `overflow-hidden`.

Build it in layers, back to front, all with Framer Motion:

1. **Sky/haze layer** — a very slow horizontal drift, 60s loop, near-invisible. Just texture.
2. **Distant hills** — an SVG silhouette in `forest-deep`, drifting right-to-left at 40s per loop. Nod to the Nepali highway.
3. **Road line** — a horizontal dashed line in `cream/30` at the lower third, animating its `stroke-dashoffset` continuously so the dashes appear to rush past. 1.2s linear loop. This is what sells the motion.
4. **Car silhouette** — a single clean side-profile SVG of an SUV in `cream`, sitting centred on the road line. It does **not** drive across; the world moves and the car holds still. Add a tiny 3px vertical bob on a 2s ease-in-out loop so it feels alive, and a soft elliptical shadow under it that scales with the bob.
5. **Headlight sweep** — a soft radial cream glow that passes left-to-right across the whole hero every 9 seconds. Slow, subtle.

On top, left-aligned (not centred — centred hero text is the default everyone uses):

- Eyebrow: `SECOND-HAND VEHICLES · KATHMANDU` — mono, `text-xs`, `tracking-[0.2em]`, `cream/60`
- Heading, two lines, `text-5xl md:text-7xl lg:text-8xl`, `font-display`, `leading-[0.9]`, `tracking-tighter`, cream:
  - Line 1: `Bought right.`
  - Line 2: `Sold honest.` — in `moss` lightened, second line pulled up `-mt-2`
- Subtitle: `Inspected, documented, and priced in the open. Every vehicle on this lot.` — `text-lg`, `cream/70`, `max-w-md`
- Two buttons, `gap-3`: `Browse cars` (cream background, forest text, `rounded-full`, `px-6 py-3`) and `Get a quote for yours` (transparent, `1px cream/40` border, cream text, hover fills to `cream/10`)
- Bottom-left corner: three odometer stats in mono — `184 cars sold`, `11 years`, `7 provinces served`. They count up once on load.

**Reduced motion:** if `prefers-reduced-motion` is set, freeze every loop. Show layers 1–4 as a static composition. No exceptions. Build the `useReducedMotion` hook and wire it through.

**Below the hero:**

- **Featured cars** — 3 cards from `/cars/featured`, fade-and-rise in on scroll, staggered 80ms.
- **Why us** — 3 short columns, no icons, just a mono numeral, a heading and two lines. Content: paperwork done properly, 120-point inspection, price shown up front.
- **Sell your car band** — full-width `forest` block, one line of copy, one button to `/sell`.
- **Footer** — logo, address, phone, viber, email, hours, quick links, a line of small print. `forest` background, cream text.

### 8.2 Listings (`/listings`)

- Sticky `FilterBar` under the nav: make, body type, fuel, transmission, price range, sort. On mobile it collapses into a `Filters` button that opens a bottom sheet.
- Active filters shown as removable chips.
- Filter state lives in the URL query string so a filtered view is shareable.
- Grid: 1 col mobile / 2 tablet / 3 desktop, `gap-6`.
- **CarCard:** 16:10 image, `object-cover`, subtle scale on hover (1.03, 400ms). Status badge top-left if reserved or sold. Below: year + make + model, then a mono spec row (`46,000 km · Diesel · Automatic`), then the price as an odometer in display font. `Negotiable` in small text if applicable. Sold cards are desaturated and not clickable.
- Skeleton cards while loading. Empty state: `No cars match these filters.` plus a `Clear filters` button.
- Pagination: a `Load more` button, not numbered pages.

### 8.3 Car detail (`/cars/:slug`)

- Image gallery: large main image, thumbnail strip below, arrow keys and swipe supported, click to open a lightbox.
- Right column, sticky on desktop: price odometer, status, a `Call about this car` button (`tel:` link) and a `Message on Viber` button.
- Spec table in mono, two columns, alternating row background.
- Description and highlights.
- `Similar cars` row at the bottom — same body type, 3 cars.

### 8.4 Sell your car (`/sell`)

Three steps, one screen each, with a progress indicator. Do not put 15 fields on one page.

1. **Your vehicle** — make, model, year, km, fuel, transmission, ownership, condition.
2. **Photos** — drag-and-drop zone, or tap to pick. 1–6 images. Show thumbnails with a remove button, file size, and a progress bar per file. Compress client-side before upload (`browser-image-compression`, target 1600px longest edge) — most users will be on mobile data.
3. **Your details** — name, phone, city, optional email, optional expected price, optional notes.

Validation with `react-hook-form` + `zod`, inline errors, validated on blur. Phone must match `^9[678]\d{8}$`.

On success: a confirmation screen with the `refCode` in large mono type, the message `We'll call you within one working day.`, and a copy button. On failure: keep the form filled, show what went wrong, offer retry.

### 8.5 Gallery (`/gallery`)

- Masonry layout, `columns-2 md:columns-3 lg:columns-4`, `gap-4`.
- Lazy loaded, `loading="lazy"`, with a blurred low-res placeholder.
- Click opens a lightbox with keyboard nav (arrows, Esc) and a `View this car` link back to its detail page.
- Filter chips at the top by body type.

### 8.6 About (`/about`)

Short. Who we are, where the lot is, an embedded map, opening hours, and the phone number again.

---

## 9. Quality floor

Non-negotiable, and don't announce these in the UI:

- Responsive from 360px up. Test at 360, 768, 1024, 1440.
- Every interactive element reachable by keyboard with a visible focus ring in `moss`.
- Real `alt` text on every image, generated from the car name.
- Semantic HTML. One `h1` per page.
- `prefers-reduced-motion` respected everywhere.
- Lighthouse: performance ≥ 90 on mobile, accessibility ≥ 95.
- Images served as WebP with a JPEG fallback.
- Per-page `<title>` and meta description. Open Graph tags on car detail pages using the first car image.
- Error boundary around the app. A real 404 page, not a blank screen.

## 10. Copy tone

Plain and direct. We are a dealership, not a luxury brand. Short sentences. No "unlock", no "elevate", no "journey". Prices always formatted `Rs. 84,50,000` using the Nepali lakh grouping — write a `formatNPR()` helper and use it everywhere, never inline `toLocaleString`.

Buttons say what happens: `Browse cars`, `Get a quote`, `Send my details`, `Call about this car`.

---

## 11. Build order

1. Read `docker-compose.yaml`, report findings, extend it.
2. Backend: models, routes, validation, uploads, error handling. Verify with curl.
3. Seed script + seed JSON + placeholder images.
4. Frontend scaffold: Vite, Tailwind config with the tokens above, fonts, routing, API client.
5. Landing page hero. Get the motion right before moving on.
6. Listings + car detail.
7. Sell-your-car flow.
8. Gallery, About, footer, 404.
9. Accessibility and performance pass.
10. `README.md` with setup, commands, and env var docs.

Stop and show me the hero once it's working, before building the rest of the pages.

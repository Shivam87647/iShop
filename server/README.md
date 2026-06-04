# iShop API — Production E-Commerce Backend

REST API backing the **iShop** Next.js storefront (`/Users/mac/Desktop/E_Commerce`).

## Stack

- Node.js 18+, Express 4, MongoDB, Mongoose  
- JWT access + refresh tokens (httpOnly cookie + JSON body)  
- Bcrypt, Helmet, CORS, rate limiting, mongo-sanitize, xss-clean, hpp  
- Zod validation, Winston logging, Cloudinary-ready uploads  
- Service-layer architecture with centralized error handling  

## Quick start

```bash
cd server
cp .env.example .env
npm install
# Start MongoDB locally, then:
npm run seed
npm run dev
```

API base: `http://localhost:5000/api/v1`

### Seed credentials

| Role  | Email              | Password        |
|-------|--------------------|-----------------|
| Admin | admin@ishop.local  | Admin@123456    |
| User  | demo@ishop.local   | Demo@123456     |

## Frontend integration

Product responses use the same shape as `src/data/products.ts`:

```json
{
  "id": "iphone-11-pro",
  "name": "...",
  "category": "iphone",
  "price": 899,
  "originalPrice": 999,
  "rating": 5,
  "image": "https://...",
  "colors": [{ "name": "Space Gray", "hex": "#4A4B4D" }],
  "specs": [{ "label": "Display", "value": "..." }]
}
```

Set in Next.js:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Send `Authorization: Bearer <accessToken>` for protected routes.

## API overview

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register |
| POST | `/login` | — | Login |
| POST | `/logout` | — | Revoke refresh token |
| POST | `/refresh` | — | Rotate tokens |
| POST | `/forgot-password` | — | Email reset link |
| PATCH | `/reset-password/:token` | — | Reset password |
| GET | `/me` | User | Profile |
| PATCH | `/me` | User | Update profile |
| POST/PATCH/DELETE | `/addresses` | User | Address CRUD |

### Products — `/api/v1/products`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List (category, search, price, color, sort, pagination) |
| GET | `/home` | Featured, top rated, offers, trending |
| GET | `/featured` | Featured products |
| GET | `/trending` | Trending products |
| GET | `/:slug` | Product detail + related |
| GET | `/:slug/reviews` | Reviews |
| POST | `/:slug/reviews` | Create review (auth) |
| POST | `/` | Create product (admin) |
| PATCH | `/manage/:id` | Update product (admin) |

**Query params (store page):** `category`, `search`, `minPrice`, `maxPrice`, `color`, `sort` (`default`|`price-low`|`price-high`|`rating`), `page`, `limit`, `wishlist=true` (auth).

### Cart — `/api/v1/cart` (auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Cart + totals (shipping, coupon) |
| POST | `/items` | Add (`productSlug`, `quantity`, `selectedColor`) |
| PATCH | `/items/:itemId` | Update quantity |
| DELETE | `/items/:itemId` | Remove line |
| POST | `/coupon` | Apply `ISHOP10` / `APPLE20` |

Commerce rules match frontend: free shipping over **$500**, otherwise **$45**.

### Wishlist — `/api/v1/wishlist` (auth)

| Method | Path |
|--------|------|
| GET | `/` |
| POST | `/` body `{ productSlug }` |
| POST | `/toggle` |
| DELETE | `/:productSlug` |

### Orders — `/api/v1/orders` (auth)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create from cart + payment intent |
| POST | `/payments/verify` | Confirm payment |
| GET | `/` | Order history |
| GET | `/:id` | Order detail |
| PATCH | `/:id/cancel` | Cancel (if allowed) |
| GET | `/admin/all` | All orders (admin) |
| PATCH | `/:id/status` | Update status (admin) |

### Categories — `/api/v1/categories`

| Method | Path |
|--------|------|
| GET | `/` |
| POST/PATCH/DELETE | admin |

### Admin — `/api/v1/admin`

| Method | Path |
|--------|------|
| GET | `/dashboard` |
| GET | `/users` |
| PATCH | `/users/:id` |

## Architecture

```
Request → Routes → Validation (Zod) → Controller → Service → Model → MongoDB
                ↓
         Error handler (AppError + operational errors)
```

**Security:** JWT rotation with hashed refresh tokens in DB, password strength rules, rate limits on auth, NoSQL injection and XSS middleware, RBAC (`user` | `admin`).

**Orders:** MongoDB transactions for inventory reservation; coupon usage; payment verification hook for Stripe/mock.

## Payment gateway

1. `POST /orders` returns `payment` + `clientSecret`.  
2. Complete payment with provider (or mock).  
3. `POST /orders/payments/verify` with `{ paymentId, providerPaymentId? }`.

Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for production Stripe.

## License

Private — iShop project.

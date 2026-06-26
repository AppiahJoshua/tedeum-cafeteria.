# 🍽️ Te-Deum L'Audamus Cafeteria — Full Stack Website

**"We Create, You Enjoy"**
**Location:** Unnamed Road, Techiman, Bono East Region, Ghana (H3M7+2P Techiman)
**Stack:** Node.js · Express · SQLite · Paystack (Mobile Money) · Hubtel SMS · JWT Auth

---

## 📁 Project Structure

```
tedeum/
├── index.html              ← Homepage
├── about.html              ← About Us / Our Story
├── menu.html                ← Full Menu (100+ dishes, 12 categories)
├── order.html               ← Online Ordering (Delivery / Pickup / Drive-Through)
├── reservations.html        ← Table Reservations
├── gallery.html             ← Photo Gallery
├── catering.html            ← Cakes & Catering Packages
├── reviews.html             ← Customer Reviews
├── contact.html             ← Contact & Map
├── admin.html                ← Admin Dashboard (login required)
├── css/
│   └── styles.css           ← Design system (Elegant European Cafeteria)
├── js/
│   ├── api.js                ← API client helper
│   ├── main.js                ← Shared nav, toasts, animations
│   ├── menu.js                ← Menu page logic
│   ├── order.js               ← Order page + Paystack
│   ├── gallery.js              ← Gallery + lightbox
│   └── admin.js                ← Admin dashboard
└── backend/
    ├── server.js              ← Express server (serves frontend + API)
    ├── package.json
    ├── .env                    ← Your environment variables
    ├── tedeum.db                ← SQLite database (auto-created)
    ├── db/
    │   ├── database.js         ← DB init & schema
    │   └── seed.js              ← Seeds ~95 menu items + 3 reviews
    ├── routes/
    │   ├── auth.js              ← Login / JWT
    │   ├── menu.js              ← Menu CRUD + image upload
    │   ├── orders.js            ← Orders management
    │   └── other.js             ← Reservations, Reviews, Contact, Payments, Dashboard
    ├── middleware/
    │   └── auth.js              ← JWT middleware
    └── utils/
        └── helpers.js           ← SMS templates, ID generators
```

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) — version 18 or higher.

### 2. Install dependencies
```bash
cd tedeum/backend
npm install
```

> ⚠️ **Windows users:** if `better-sqlite3` fails to install with a compilation error, run:
> ```bash
> npm uninstall better-sqlite3
> npm install better-sqlite3
> ```
> This pulls a pre-built binary and avoids the need for Visual Studio build tools.

### 3. Configure environment
The `.env` file is pre-filled with working defaults for local testing. Update later with real Paystack/Hubtel keys.

### 4. Seed the database
```bash
npm run seed
```
This creates `tedeum.db` and loads ~95 menu items across 12 categories + 3 sample reviews.

### 5. Start the server
```bash
npm start
```

Open **http://localhost:3000** — the full website is live!
Admin dashboard: **http://localhost:3000/admin.html**

---

## 🔑 Admin Login

| Field    | Value                |
|----------|----------------------|
| Username | `admin`              |
| Password | `tedeum@admin2026`   |

**Change these in `.env` before going live.**

---

## 💳 Paystack Setup (Mobile Money Payments)

1. Register at [dashboard.paystack.com](https://dashboard.paystack.com)
2. Go to **Settings → API Keys & Webhooks**
3. Copy your **Secret Key** and **Public Key**
4. Add to `.env`:
   ```
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxx
   PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
   ```
5. Add the public key to `order.html`:
   ```html
   <meta name="paystack-key" content="pk_live_xxxxxxxxxxxx">
   ```

Supports **MTN Mobile Money**, **Vodafone Cash**, and **AirtelTigo Money**.

---

## 📱 Hubtel SMS Setup

1. Register at [unity.hubtel.com](https://unity.hubtel.com)
2. Get your **Client ID** and **Client Secret**
3. Add to `.env`:
   ```
   HUBTEL_CLIENT_ID=xxxxxxxx
   HUBTEL_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
   HUBTEL_SENDER_ID=TeDeum
   HUBTEL_ENABLED=true
   ```

When `HUBTEL_ENABLED=false`, SMS messages are logged to the console instead of sent.

---

## 📸 Menu Photos

In **Admin → Menu Management**, click **📷 Add photo** next to any dish to upload a real photo (jpg/png/webp, max 5MB). Photos appear instantly on the public menu page. Click **🔄 Change photo** to replace, or **✕ Photo** to remove.

---

## 🌐 API Reference

All endpoints are under `/api/`. Admin routes require `Authorization: Bearer <token>`.

| Method | Endpoint                        | Auth  | Description               |
|--------|---------------------------------|-------|----------------------------|
| POST   | /api/auth/login                 | —     | Admin login                |
| GET    | /api/menu                       | —     | Get available menu items   |
| POST   | /api/menu                       | Admin | Add menu item               |
| PUT    | /api/menu/:id                   | Admin | Update menu item            |
| PATCH  | /api/menu/:id/toggle             | Admin | Toggle availability         |
| POST   | /api/menu/:id/image              | Admin | Upload food photo            |
| DELETE | /api/menu/:id/image              | Admin | Remove food photo            |
| DELETE | /api/menu/:id                   | Admin | Delete menu item             |
| POST   | /api/orders                     | —     | Place an order                |
| GET    | /api/orders                     | Admin | List all orders               |
| PUT    | /api/orders/:id/status            | Admin | Update order status            |
| POST   | /api/reservations                | —     | Make a reservation              |
| GET    | /api/reservations                | Admin | List all reservations           |
| PUT    | /api/reservations/:id/status       | Admin | Confirm / cancel                 |
| POST   | /api/reviews                     | —     | Submit a review                   |
| GET    | /api/reviews                     | —     | Get approved reviews               |
| PUT    | /api/reviews/:id/approve           | Admin | Approve a review                    |
| DELETE | /api/reviews/:id                  | Admin | Delete a review                      |
| POST   | /api/contact                     | —     | Send a contact message                |
| GET    | /api/contact                     | Admin | List messages                          |
| POST   | /api/payments/initialize           | —     | Initialize Paystack                     |
| GET    | /api/payments/verify/:ref          | —     | Verify payment                           |
| POST   | /api/payments/webhook              | —     | Paystack webhook                          |
| GET    | /api/dashboard/stats               | Admin | Dashboard statistics                       |

---

## ☁️ Deploying to Production (Render.com)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `backend`
4. **Build Command**: `npm install && node db/seed.js`
5. **Start Command**: `npm start`
6. Add all `.env` variables in Render's Environment tab
7. Set `NODE_ENV=production` and `FRONTEND_URL=https://your-app.onrender.com`

---

## 📞 Restaurant Details

| Info        | Details                                    |
|-------------|---------------------------------------------|
| Address     | Unnamed Road, Techiman (H3M7+2P)            |
| Hours       | Monday – Sunday, opens 8:00 AM              |
| Services    | Dine-in · Drive-through · Delivery · Full Bar |
| Rating      | 3.3★ (20 Google reviews)                     |

---

*Built with ❤️ for Te-Deum L'Audamus Cafeteria, Techiman, Ghana 🇬🇭*

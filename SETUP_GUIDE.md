# 🌟 ANGLELIX by Suraj — Complete Setup & Configuration Guide

This guide walks you step-by-step through configuring **Google OAuth Authentication**, **Supabase Database & Storage**, **Razorpay Payment Gateway**, and **Production Deployment**.

---

## 📑 Table of Contents
1. [Google OAuth Setup (Step-by-Step)](#1-google-oauth-setup)
2. [Supabase Database & Storage Initialization](#2-supabase-database--storage-initialization)
3. [Razorpay Payment Gateway Configuration](#3-razorpay-payment-gateway-configuration)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Admin Account Setup](#5-admin-account-setup)
6. [Local Testing & Production Deployment](#6-local-testing--production-deployment)
7. [Pre-Launch Verification Checklist](#7-pre-launch-verification-checklist)

---

## 1. Google OAuth Setup

### Step 1.1: Create a Project in Google Cloud Console
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Click the top-left project dropdown → **New Project**.
3. Project Name: `Anglelix Fragrances` → click **Create**.
4. Select the newly created project.

### Step 1.2: Configure the OAuth Consent Screen
1. Navigate to **APIs & Services → [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)**.
2. Select **External** → click **Create**.
3. Fill in:
   - **App name**: `Anglelix`
   - **User support email**: `your-email@gmail.com`
   - **Developer contact email**: `your-email@gmail.com`
4. Click **Save and Continue** through **Scopes** (defaults are fine).
5. In **Test Users**, add your own Google email address so you can test immediately.
6. Click **Save and Continue** → **Back to Dashboard**.

### Step 1.3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services → [Credentials](https://console.cloud.google.com/apis/credentials)**.
2. Click **+ CREATE CREDENTIALS** (top bar) → select **OAuth client ID**.
3. Configure the credential:
   - **Application type**: `Web application`
   - **Name**: `Anglelix Web App`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://phqtdxppwijrtwzibdex.supabase.co`
     - *(Add your live domain when ready, e.g. `https://angelix.in`)*
   - **Authorized redirect URIs**:
     ```
     https://phqtdxppwijrtwzibdex.supabase.co/auth/v1/callback
     ```
4. Click **Create**.
5. Copy your **Client ID** and **Client Secret**.

### Step 1.4: Enable Google Provider in Supabase
1. Open your **[Supabase Dashboard](https://supabase.com/dashboard/project/phqtdxppwijrtwzibdex)**.
2. In the sidebar, go to **Authentication → Providers**.
3. Click on **Google**:
   - Toggle **Enable Google provider** to **ON**.
   - Paste **Client ID (for OAuth)**.
   - Paste **Client Secret (for OAuth)**.
   - Click **Save**.
4. In the sidebar, go to **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` *(change to live domain on production)*
   - **Redirect URLs** (add both):
     - `http://localhost:3000/auth/callback`
     - `https://<your-production-domain>/auth/callback`
   - Click **Save**.

---

## 2. Supabase Database & Storage Initialization

If you haven't initialized the database and storage buckets yet, execute the following in your **Supabase SQL Editor**:

### Step 2.1: Run Complete Database Migration
Open **[Supabase SQL Editor](https://supabase.com/dashboard/project/phqtdxppwijrtwzibdex/sql)** and execute the contents of:
- `supabase/SETUP_COMPLETE.sql`
*(This creates `profiles`, `products`, `categories`, `orders`, `order_items`, `coupons`, `banners`, `settings`, and sets up Row Level Security policies and sample data).*

### Step 2.2: Set Up Storage Buckets for Image Uploads
Execute the contents of:
- `supabase/storage_setup.sql`
*(This creates public storage buckets `products` and `banners` allowing admin image uploads).*

---

## 3. Razorpay Payment Gateway Configuration

### Step 3.1: Get API Keys
1. Log in to your **[Razorpay Dashboard](https://dashboard.razorpay.com/)**.
2. Go to **Settings → API Keys**.
3. Generate **Key ID** (e.g., `rzp_test_...` or `rzp_live_...`) and **Key Secret**.
4. Update your `.env.local` file:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

### Step 3.2: Set Up Webhooks (Optional for Automated Updates)
1. In Razorpay Dashboard, go to **Settings → Webhooks → Add New Webhook**.
2. **Webhook URL**: `https://<your-domain>/api/webhooks/razorpay`
3. **Secret**: Create a strong random secret and add to `.env.local` as `RAZORPAY_WEBHOOK_SECRET`.
4. **Active Events**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`

---

## 4. Environment Variables Reference

Your `.env.local` (local) and Vercel/Hosting Environment Variables (production):

| Variable Name | Environment | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client + Server) | Your Supabase project URL (`https://phqtdxppwijrtwzibdex.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client + Server) | Supabase anonymous public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only (Secret)** | Supabase service role key for admin operations |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public (Client) | Razorpay public Key ID |
| `RAZORPAY_KEY_ID` | **Server-Only (Secret)** | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | **Server-Only (Secret)** | Razorpay Secret Key for HMAC signature verification |
| `RAZORPAY_WEBHOOK_SECRET` | **Server-Only (Secret)** | Razorpay Webhook Secret for webhook verification |
| `NEXT_PUBLIC_SITE_URL` | Public | Base website URL (`http://localhost:3000` or `https://angelix.in`) |

> ⚠️ **CRITICAL SECURITY RULE:** Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET` in client-side code (`NEXT_PUBLIC_...`).

---

## 5. Admin Account Setup

To access `/admin` and manage products, banners, orders, and coupons:

1. Create a user account by registering on `/register` or via Supabase Dashboard (`Authentication → Users → Add User`).
2. Run this SQL in your **Supabase SQL Editor** to grant admin privileges:
   ```sql
   -- Replace with your admin email
   INSERT INTO admins (user_id, role)
   SELECT id, 'super_admin'
   FROM auth.users
   WHERE email = 'suraj@angelix.in'
   ON CONFLICT (user_id) DO NOTHING;

   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'suraj@angelix.in';
   ```
3. You can now log in at `/admin/login` and access the complete administration dashboard!

---

## 6. Local Testing & Production Deployment

### Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build validation check
npm run build
```

### Deploying to Vercel
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "chore: ready for deployment"
   git push origin main
   ```
2. Go to **[Vercel Dashboard](https://vercel.com/)** → **Add New Project** → Import `angelix` repository.
3. In **Environment Variables**, paste all the keys from Section 4.
4. Click **Deploy**.
5. Once deployed, update your **Site URL** and **Redirect URLs** in Supabase and Google Cloud Console with your production domain!

---

## 7. Pre-Launch Verification Checklist

- [ ] **Google Sign-In**: Test Google OAuth login on `/login`, `/register`, and `/checkout`.
- [ ] **Email Authentication**: Test traditional email/password registration and login.
- [ ] **Cart & Checkout**:
  - [ ] Add full bottle and 2ml/5ml/10ml tester vials to cart.
  - [ ] Test 6-digit Indian PIN code autofill.
  - [ ] Test coupon code validation (e.g. `WELCOME10` or promo coupons).
  - [ ] Place an order using **Cash on Delivery (COD)**.
  - [ ] Place an order using **Razorpay UPI / Cards**.
- [ ] **Order Confirmation**: Confirm redirection to `/order-confirmation/[orderId]` with WhatsApp update notice.
- [ ] **Customer Dashboard**: Verify orders appear under `/account/orders`.
- [ ] **Admin Dashboard**:
  - [ ] Verify orders appear under `/admin/orders`.
  - [ ] Test adding/editing a product under `/admin/products`.
  - [ ] Test banner management under `/admin/banners`.
  - [ ] Test promo bar management under `/admin/promobar`.

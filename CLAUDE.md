@AGENTS.md
# MASTER PROMPT — ANGLELIX BY SURAJ

Act as a senior full-stack engineer, UI/UX designer, e-commerce architect, database engineer, and security engineer.

Build a complete production-ready luxury perfume e-commerce website for:

**Brand Name:** Anglelix
**Subtitle:** by Suraj

The final website must feel:

* Premium
* Elegant
* Minimal
* Sophisticated
* Editorial
* Luxury fragrance focused
* Light themed
* Fast
* Mobile-first
* Smoothly animated
* Professional rather than flashy

Do not make the website look like a generic Shopify template.

The visual direction should feel like a modern luxury fragrance house using large amounts of white/off-white space, black typography, subtle warm beige/cream accents, soft shadows, premium product photography, carefully controlled animations, and excellent spacing.

---

# 1. RECOMMENDED TECH STACK

Use:

* Next.js latest stable version
* TypeScript
* Tailwind CSS
* shadcn/ui where useful
* Framer Motion for subtle animations
* Supabase
* Supabase PostgreSQL
* Supabase Auth
* Supabase Storage
* Razorpay
* Server-side API routes / server actions
* Zod for validation
* React Hook Form
* Lucide icons
* Sonner/toast notifications

The architecture must be scalable and production-ready.

Use clean reusable components and do not hard-code editable business information into components where it should come from Supabase.

---

# 2. BRAND DESIGN SYSTEM

Create a premium visual identity around:

**ANGLELIX**
**by Suraj**

Logo direction:

ANGLELIX should be the dominant wordmark.

"by Suraj" should appear smaller underneath or aligned elegantly with the primary logo.

Create space in the code for uploading/replacing the actual brand logo later from the admin dashboard.

Primary visual palette:

* Background: #FFFFFF
* Secondary background: #FAF9F7
* Warm cream: #F4F0E8
* Main text: #111111
* Secondary text: #666666
* Border: #E8E5DF

Use black primarily for CTA buttons.

Avoid excessive gold gradients.

The luxury feel should come from typography, white space, photography and composition rather than decorative effects.

Typography:

Use an elegant premium serif font for major editorial headings where suitable and a clean modern sans-serif font for:

* navigation
* pricing
* buttons
* descriptions
* UI
* forms

Typography must remain highly readable.

---

# 3. GLOBAL WEBSITE STRUCTURE

Create these primary routes:

/
/shop
/category/[slug]
/fragrance/[slug]
/product/[slug]
/testers
/about
/login
/register
/account
/account/orders
/cart
/checkout
/order-confirmation/[orderId]
/privacy
/terms
/shipping-policy
/return-policy
/contact

Admin routes:

/admin
/admin/products
/admin/categories
/admin/orders
/admin/customers
/admin/banners
/admin/promobar
/admin/coupons
/admin/offers
/admin/testers
/admin/settings

Protect all admin routes.

---

# 4. HOMEPAGE STRUCTURE

Homepage should follow this structure:

1. Promo Bar
2. Navbar
3. Promotional/Hero Banner
4. Featured category navigation
5. Product collection/grid
6. Featured fragrance section
7. Tester CTA
8. Image-only CTA
9. Brand story teaser
10. Newsletter / optional promotional section
11. Footer

Keep the page clean.

Do not overcrowd it.

---

# 5. PROMOTIONAL BAR

At the very top create a slim promotional announcement bar.

Examples:

"FREE SHIPPING ON ORDERS ABOVE ₹1,499"

or

"DISCOVER YOUR SIGNATURE SCENT"

or

"BUY 2, GET 10% OFF"

The content must come dynamically from Supabase.

Admin should be able to:

* enable/disable promo bar
* edit text
* add optional link
* select link destination
* schedule start date
* schedule end date

Allow multiple promo announcements and optionally rotate them automatically.

Animation should be subtle.

---

# 6. NAVBAR

Create a premium sticky navbar.

Desktop:

LEFT:
Menu button / hamburger

CENTER:
ANGLELIX
by Suraj

RIGHT:
Search
Account
Cart icon with quantity badge

Mobile:

Hamburger
Centered logo
Cart icon

The navbar should become slightly condensed/shadowed when scrolling.

---

# 7. FULL SCREEN MENU

When the Menu button is clicked, open a premium full-height menu drawer/overlay.

Include:

SHOP / CATEGORIES

Examples:

* All Perfumes
* Men
* Women
* Unisex
* Best Sellers
* New Arrivals
* Gift Sets
* Testers

FRAGRANCE

Allow users to browse by fragrance family:

* Woody
* Fresh
* Aquatic
* Citrus
* Floral
* Fruity
* Oud
* Amber
* Musk
* Spicy
* Gourmand

The list must be dynamically fetched from Supabase.

Also include:

TRY OUR TESTER

KNOW ABOUT ANGLELIX

LOGIN / MY ACCOUNT

FOLLOW US

Instagram icon must be clickable.

Provide an obvious elegant Close button.

The menu should animate smoothly in and out.

---

# 8. HERO / PROMOTIONAL BANNER

Create a premium full-width promotional banner.

Admin should be able to upload:

* desktop image
* mobile image

Also support:

* optional title
* optional subtitle
* CTA label
* CTA URL
* text alignment
* banner activation
* start/end dates

However, allow banners to also function as pure image banners without visible text.

Use picture/source or optimized responsive image loading.

Avoid placing text over important product areas of the photograph.

---

# 9. PRODUCT GRID

Use the uploaded reference product card as the structural inspiration.

The card should remain minimal and premium.

Each product card should contain:

Large perfume image

PRODUCT NAME

Example:

THRONE (100ML)

Then small fragrance/characteristic chips such as:

LEATHER
UNISEX
PARFUM

Then:

₹2,499

Then:

ADD TO CART

Maintain consistent card heights.

Product image should dominate the card.

Recommended desktop layout:

4 products per row on large desktop.

3 on medium screens.

2 on mobile when space permits.

1 if screen is extremely narrow.

Use subtle hover interaction:

* product image slight scale
* clean transition
* button state feedback

Do not use aggressive animations.

---

# 10. PRODUCT DATA MODEL

Each product must support:

* Product name
* Slug
* SKU
* Short description
* Full description
* Brand
* Category
* Gender
* Fragrance family
* Concentration
* Quantity / volume
* Original price
* Sale price
* Discount percentage
* Stock quantity
* Low-stock threshold
* Main image
* Multiple gallery images
* Thumbnail image
* Top notes
* Middle/heart notes
* Base notes
* Longevity
* Projection
* Season suitability
* Occasion
* Ingredients
* How to apply
* Usage instructions
* Delivery estimate
* Featured
* Best seller
* New arrival
* Tester available
* Published/unpublished
* SEO title
* SEO description
* created_at
* updated_at

---

# 11. PRODUCT DETAIL PAGE

Every perfume must have a dedicated product page.

Example:

/product/throne-100ml

Create a premium two-column desktop layout.

LEFT:

Product gallery.

Large product image.

Thumbnail gallery beneath/beside it.

Images should not contain artificial headings over them.

Support:

* click thumbnails
* swipe on mobile
* zoom or lightbox

RIGHT:

Product name

Example:

THRONE

Volume:

100ML

Fragrance tags:

LEATHER
UNISEX
PARFUM

Rating if available

Price

Compare-at price if discounted

Discount badge if relevant

Short description

Quantity selector

ADD TO CART

BUY NOW

Optional:

TRY TESTER

Below that display:

* fragrance notes
* scent profile
* description
* longevity
* projection
* concentration
* ideal occasions
* season
* ingredients
* how to apply
* shipping and returns

---

# 12. HOW TO APPLY SECTION

Create an editorial section explaining how to apply perfume.

Example content:

Spray on pulse points such as:

* wrists
* neck
* behind ears
* inner elbows

Apply from approximately 10–15 cm away.

Avoid rubbing wrists together after application.

For longer wear, apply lightly to moisturized skin.

Allow this content to be edited from admin/product settings.

Use icons or minimal illustrations if helpful.

---

# 13. FRAGRANCE NOTES UI

Display three premium cards or sections:

TOP NOTES

HEART NOTES

BASE NOTES

Allow notes to include:

* text
* optional icon/image

For example:

Top:
Bergamot
Saffron

Heart:
Leather
Rose

Base:
Oud
Amber
Musk

Use elegant visual hierarchy.

---

# 14. TESTER PAGE

Create:

/testers

Purpose:

Allow customers to experience fragrances before purchasing full bottles.

Show tester products separately.

Each tester should be manageable as a product or variant.

Possible sizes:

2ML
5ML
10ML

Allow bundle options such as:

DISCOVERY SET

Choose any 3 fragrances.

Admin should be able to control tester availability and pricing.

---

# 15. IMAGE-ONLY CTA

Create a full-width premium CTA section where only a visual image is shown.

No headline.

No paragraph.

No button floating over it.

The image itself should be clickable.

Admin should be able to set:

* image
* mobile image
* destination URL
* active/inactive

Use subtle hover scaling on desktop.

---

# 16. ABOUT / KNOW ANGLELIX PAGE

Create:

/about

Tell the Anglelix brand story elegantly.

Suggested sections:

ANGLELIX BY SURAJ

Our philosophy

Our approach to fragrance

Craftsmanship

Quality

Signature identity

Why Anglelix

Avoid generic fake luxury claims.

Leave content editable from admin.

Use premium imagery and editorial layouts.

---

# 17. CART

Create a proper shopping cart.

Features:

* product thumbnail
* product name
* volume
* price
* quantity +/-
* remove item
* subtotal
* coupon field
* discount
* shipping
* grand total

Persist cart for guests using local storage/cookies.

For logged-in users synchronize appropriately with account state/database.

Cart drawer can be accessible from navbar.

Also create full:

/cart

page.

---

# 18. COUPON SYSTEM

Admin can create coupons.

Fields:

* Coupon code
* Description
* Discount type
* Percentage
* Fixed discount
* Minimum order value
* Maximum discount
* Usage limit
* Usage limit per customer
* Start date
* Expiry date
* Applicable products
* Applicable categories
* First-order-only
* Active/inactive

Coupon validation must happen server-side.

Never trust discount calculations from the frontend.

---

# 19. CHECKOUT PAGE

Create:

/checkout

Checkout should be clean and distraction-free.

Collect:

First Name
Last Name
Phone Number
WhatsApp Number
Email
Address Line 1
Address Line 2
Landmark
City
State
PIN Code
Country

Default country:

India

Allow:

Same phone number for WhatsApp toggle.

Show order summary beside/below form.

Order summary:

Products
Quantity
Subtotal
Coupon discount
Shipping
Taxes if applicable
Grand total

Primary CTA:

PROCEED TO PAYMENT

---

# 20. RAZORPAY PAYMENT INTEGRATION

Integrate Razorpay securely.

Use server-side order creation.

Do NOT trust order totals sent from frontend.

Correct flow:

1. User starts checkout
2. Server fetches authoritative product prices from database
3. Server validates stock
4. Server applies validated coupon
5. Server calculates final total
6. Server creates pending order
7. Server creates Razorpay order
8. Razorpay Checkout opens
9. Payment completes
10. Server verifies Razorpay signature
11. Update order payment status only after successful verification
12. Trigger confirmation flow

Store:

razorpay_order_id
razorpay_payment_id
razorpay_signature
payment_status

Never expose Razorpay secret key to frontend.

Use environment variables.

---

# 21. COD ARCHITECTURE

Structure the checkout so Cash on Delivery can easily be enabled later.

Admin settings should include:

Enable Razorpay

Enable COD

If COD is disabled, do not display it.

---

# 22. ORDER CONFIRMATION PAGE

Create:

/order-confirmation/[orderId]

Display:

CHECK ICON

"Thank You for Your Order"

Order ID

Payment status

Order items

Shipping address

Amount paid

Then prominently display this message:

"Your order has been successfully placed. We will share your shipment and tracking updates with you on WhatsApp."

Also add:

CONTINUE SHOPPING

VIEW ORDER

Use polished animation after successful payment, but no childish/confetti-heavy effects.

---

# 23. WHATSAPP CUSTOMER FLOW

Store customer's WhatsApp number with the order.

Architecture should be ready to integrate WhatsApp Business Cloud API later.

Keep order status values such as:

Order Placed

Payment Confirmed

Processing

Packed

Shipped

Out for Delivery

Delivered

Cancelled

Refunded

Store:

courier_name

tracking_number

tracking_url

Once shipping information is entered from the admin dashboard, prepare backend hooks/webhooks so WhatsApp shipment notifications can be added easily.

Do not falsely send WhatsApp messages unless credentials/API are configured.

---

# 24. CUSTOMER AUTHENTICATION

Use Supabase Auth.

Allow:

Email/password login

Optional magic link if desired

Create:

/login
/register
/account

Customer dashboard should show:

Profile

Saved contact details

Addresses

Order history

Order detail

Order status

Tracking information

Logout

Do not expose admin privileges based only on frontend conditions.

---

# 25. CUSTOMER DATABASE

Create customer profiles table.

Store:

id
auth_user_id
first_name
last_name
email
phone
whatsapp_number
created_at
updated_at

Optional:

date_of_birth
marketing_consent

Do NOT store user passwords manually.

Authentication credentials/password handling must remain inside Supabase Auth.

The admin dashboard can display customer account information but must NEVER expose customer passwords.

---

# 26. SUPABASE DATABASE SCHEMA

Create normalized tables for:

profiles

addresses

products

product_images

categories

fragrance_families

product_fragrance_notes

orders

order_items

payments

coupons

coupon_usage

banners

promo_bars

offers

tester_products

settings

admins

audit_logs

Optional:

reviews
wishlists
newsletter_subscribers
inventory_transactions

Use:

UUID primary keys where appropriate.

created_at
updated_at

Use foreign key constraints.

Add useful indexes.

---

# 27. ROW LEVEL SECURITY

Implement proper Supabase RLS policies.

Customers should only be able to access their own:

profile

addresses

orders

wishlist

Admin operations should use verified server-side authorization.

Do not use the Supabase service role key in client-side code.

Never expose secrets in frontend JavaScript.

---

# 28. ADMIN DASHBOARD

Create a professional admin panel.

Route:

/admin

Use desktop sidebar and mobile responsive navigation.

Dashboard summary cards:

Today's Orders

Revenue

Pending Orders

Paid Orders

Shipped Orders

Delivered Orders

Total Customers

Low Stock Products

Top-selling fragrances

Recent orders table

Optional sales chart.

---

# 29. ADMIN — PRODUCT MANAGEMENT

/admin/products

Admin can:

Add product

Edit product

Delete product

Duplicate product

Publish/unpublish

Set price

Set sale price

Set stock

Set volume

Upload images

Reorder gallery images

Set fragrance family

Set tags

Set concentration

Add notes

Add description

Add how-to-apply instructions

Set tester availability

Set featured

Set bestseller

Set new arrival

Manage SEO information

Provide search, filters and pagination.

---

# 30. ADMIN — ORDER MANAGEMENT

/admin/orders

Display:

Order ID

Customer

Phone

WhatsApp

Amount

Payment method

Payment status

Order status

Date

Create filters:

New

Paid

Processing

Packed

Shipped

Delivered

Cancelled

Refunded

Admin can open an order and view:

customer info

shipping address

products

quantities

coupon

payment information

order timeline

Admin can update order status.

When marked SHIPPED:

Ask for:

Courier Name

Tracking Number

Tracking URL

Estimated delivery date

Save the information.

Prepare a backend event for WhatsApp shipment notification.

---

# 31. ADMIN — CUSTOMER MANAGEMENT

/admin/customers

Display:

Customer Name

Email

Phone

WhatsApp

Date Joined

Number of Orders

Lifetime Spend

Last Order

Admin can open customer detail and view order history.

Do not expose password information.

---

# 32. ADMIN — BANNER MANAGEMENT

/admin/banners

Allow admin to:

Upload desktop banner

Upload mobile banner

Add title

Subtitle

Link

CTA

Enable/disable

Set display order

Schedule start/end

Delete

Preview

---

# 33. ADMIN — PROMO BAR MANAGEMENT

/admin/promobar

Admin can:

Create promo message

Edit text

Add link

Enable

Disable

Schedule

Set ordering

---

# 34. ADMIN — COUPON MANAGEMENT

/admin/coupons

Create and manage full coupon rules.

Display coupon usage analytics.

---

# 35. ADMIN — OFFERS

/admin/offers

Allow creation of promotional rules such as:

Buy 2 Get 10% Off

Buy X Get Y

Category Discount

Product Discount

Free Shipping Above X

Tester bundle offers

Every discount must be validated server-side.

---

# 36. ADMIN — SETTINGS

/admin/settings

Editable values:

Brand name

Subtitle

Logo

Favicon

Instagram URL

WhatsApp Number

Support Email

Shipping charge

Free shipping minimum amount

Currency

Business address

Razorpay enable/disable

COD enable/disable

Order confirmation message

Footer information

SEO defaults

---

# 37. FOOTER

Create a minimal luxury footer.

Include:

ANGLELIX
by Suraj

SHOP

About

Testers

Contact

Login / Account

FOLLOW US

Instagram icon

CONTACT US

WhatsApp icon

Email/Gmail icon

Legal:

Privacy Policy

Terms & Conditions

Shipping Policy

Return Policy

Copyright line.

Icons must be clickable.

Admin should control social and contact links.

---

# 38. SEARCH

Add product search.

Search by:

Product name

Fragrance family

Notes

Gender

Category

Search should be fast and responsive.

Create search suggestions/autocomplete if practical.

---

# 39. FILTERING

Shop page should support filters:

Gender

Category

Fragrance Family

Price

Concentration

Volume

Availability

Best Seller

Sort:

Featured

Newest

Price Low to High

Price High to Low

Best Selling

---

# 40. RESPONSIVE DESIGN

The complete website must work perfectly at:

320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px

No horizontal overflow.

Touch-friendly mobile controls.

Mobile menu must feel native and premium.

Checkout must be extremely easy on mobile.

---

# 41. ANIMATION STYLE

Use subtle luxury motion:

* fade-up on reveal
* very mild product image scale
* smooth menu transitions
* navbar transitions
* image fade
* subtle cart interactions

Respect:

prefers-reduced-motion

Avoid:

* excessive parallax
* spinning objects
* constant floating animation
* neon glow
* aggressive glassmorphism
* unnecessarily heavy GSAP animation

Performance is more important than animation.

---

# 42. PERFORMANCE

Target excellent Lighthouse scores.

Use:

Next Image

lazy loading

responsive image sizes

compressed WebP/AVIF

server components where appropriate

code splitting

minimal JavaScript

optimized fonts

database pagination

proper caching

Avoid massive dependencies.

---

# 43. SEO

Implement:

Dynamic metadata

Product schema

Organization schema

Breadcrumb schema

OpenGraph

Twitter metadata

Canonical URLs

sitemap.xml

robots.txt

Product-specific meta titles/descriptions

Clean semantic heading hierarchy.

---

# 44. ANALYTICS EVENTS

Prepare event tracking architecture for:

view_item

add_to_cart

remove_from_cart

view_cart

begin_checkout

apply_coupon

purchase

login

sign_up

view_category

search

Do not hardcode an analytics provider unless configured.

---

# 45. SECURITY

Critical requirements:

Validate every API request.

Sanitize inputs.

Verify Razorpay signatures server-side.

Never trust price coming from frontend.

Never trust coupon amount coming from frontend.

Never expose:

SUPABASE_SERVICE_ROLE_KEY

RAZORPAY_KEY_SECRET

database credentials

Protect admin routes.

Implement role-based authorization.

Rate-limit sensitive routes where appropriate.

Use secure HTTP-only cookies where relevant.

Prevent duplicate payment callbacks from creating multiple orders.

Use idempotent webhook/payment handling.

---

# 46. INVENTORY LOGIC

Before payment:

Check product availability.

After verified payment:

Deduct stock safely.

Prevent overselling using database transaction/atomic logic wherever possible.

Cancelled/failed orders should not permanently reserve stock unless intentionally implemented.

Create low-stock warning in admin.

---

# 47. ORDER NUMBER FORMAT

Generate readable order numbers.

Example:

ANG-2026-000124

Do not expose only database UUID as customer-facing order ID.

---

# 48. EMPTY STATES

Create polished empty states for:

Cart empty

No products

No orders

Search without results

No coupons

No banners

No customers

Avoid unfinished blank screens.

---

# 49. LOADING + ERROR STATES

Implement:

Skeleton loaders

Button loading states

Payment loading state

Image loading fallback

Network error messages

404 page

500/general error page

Checkout failure state

Payment retry flow

---

# 50. PRODUCT CARD REFERENCE

Use the supplied product card screenshot as a structural reference.

The design language is:

Large centered product photograph.

Product name immediately underneath.

Small rectangular metadata labels underneath.

Example:

THRONE (100ML)

LEATHER | UNISEX | PARFUM

₹2,499

ADD TO CART

Improve the reference visually while keeping its clean product-card philosophy.

Use:

more premium spacing

better typography

lighter borders

proper image sizing

consistent card dimensions

refined button treatment

Do not copy poor-quality spacing from the screenshot literally.

---

# 51. HOMEPAGE PRODUCT SECTION EXAMPLE

Possible heading:

OUR SIGNATURES

Optional small subtitle:

Discover scents created to leave a lasting impression.

Then product grid.

But maintain the ability to remove this heading entirely if the design looks more premium without it.

---

# 52. CART DRAWER

When Add to Cart is clicked:

Update button immediately.

Show subtle success feedback.

Open optional cart drawer.

Cart drawer includes:

thumbnail

product

quantity

price

subtotal

VIEW CART

CHECKOUT

Cart should not lose products after page refresh.

---

# 53. BUY NOW

BUY NOW should:

Add chosen item/variant

Directly open checkout with that item

without unnecessarily forcing user through cart page.

---

# 54. IMAGE MANAGEMENT

Use Supabase Storage.

Recommended buckets:

products

banners

brand-assets

editorial

Use unique filenames.

Store image URLs/references in database.

Admin should be able to delete/replace images cleanly.

Compress images before/while uploading where practical.

---

# 55. INITIAL DEMO DATA

Seed approximately 6–8 placeholder perfumes so the interface can be tested.

Example names:

THRONE

NOIR

OCEAN VEIL

EMBER

VELVET OUD

AURELIA

MIDNIGHT

IMPERIUM

Use placeholder product imagery until actual Anglelix photographs are uploaded.

Do not invent misleading product claims.

---

# 56. SUPABASE MIGRATIONS

Create SQL migrations for all database tables, relationships, indexes and policies.

Also create:

seed script

README setup documentation

.env.example

Never place real credentials in repository.

---

# 57. ENVIRONMENT VARIABLES

Prepare:

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_RAZORPAY_KEY_ID=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

RAZORPAY_WEBHOOK_SECRET=

NEXT_PUBLIC_SITE_URL=

Keep secret keys server-side.

---

# 58. RAZORPAY WEBHOOK

Create secure endpoint similar to:

/api/webhooks/razorpay

Verify webhook signature.

Support relevant payment events.

Ensure webhook processing is idempotent.

Never mark an order paid solely because the frontend claims payment succeeded.

---

# 59. ADMIN AUTHORIZATION

Create admin role architecture.

Example:

profiles.role

values:

customer
admin
super_admin

Admin access must be validated server-side.

Do not simply hide buttons for non-admins.

---

# 60. UX DETAILS

Add:

Sticky Add to Cart section on mobile product page.

Smooth image swipe.

Coupon success/error feedback.

Checkout form validation.

PIN code validation suitable for India.

Phone number validation.

WhatsApp checkbox:

"Use this number for WhatsApp order updates"

Allow user to continue as guest.

Do not require account creation before checkout.

After purchase, optionally offer:

"Create an account to track your orders faster."

---

# 61. ORDER STATUS TIMELINE

Customer order page should show:

Order Placed
↓
Payment Confirmed
↓
Processing
↓
Packed
↓
Shipped
↓
Out for Delivery
↓
Delivered

Highlight current state.

After shipment display:

Courier

Tracking ID

TRACK ORDER

---

# 62. ACCESSIBILITY

Use:

Semantic HTML

Keyboard navigation

Visible focus states

ARIA labels on icon-only buttons

Proper color contrast

Descriptive alt text

Accessible dialogs/drawers

---

# 63. FINAL QUALITY STANDARD

This should feel like a real premium fragrance brand ready to accept customers and payments.

Do not produce a simple mockup.

Build:

Real database integration

Real authentication

Real cart

Real checkout

Real Razorpay architecture

Real order storage

Real admin dashboard

Real product management

Real coupon management

Real banner management

Real promo bar management

Real customer management

Real inventory management

Real responsive mobile experience

---

# 64. DEVELOPMENT ORDER

Build in this order:

PHASE 1

Project architecture
Design system
Supabase schema
Authentication

PHASE 2

Header
Promo bar
Menu
Homepage
Product grid

PHASE 3

Product pages
Categories
Search
Filters
Tester page

PHASE 4

Cart
Coupons
Checkout

PHASE 5

Razorpay
Payment verification
Orders
Confirmation page

PHASE 6

Customer account

PHASE 7

Admin dashboard

PHASE 8

Inventory
Offers
Banner management
Promo bar management

PHASE 9

SEO
Accessibility
Performance
Security testing

PHASE 10

Responsive testing
Payment testing
Production cleanup

---

# 65. IMPORTANT IMPLEMENTATION RULE

Do not stop after creating only the frontend.

Continue until the application contains a functioning backend architecture with Supabase, database migrations, authentication, admin authorization, cart/order workflow and Razorpay payment flow.

Whenever a feature requires credentials that are not provided, implement the complete integration and use environment variables with clear setup instructions instead of replacing functionality with fake frontend data.

---

# 66. FINAL DELIVERABLE

At completion provide:

1. Complete source code
2. Folder structure
3. Supabase SQL schema/migrations
4. RLS policies
5. Seed data
6. Razorpay implementation
7. Admin dashboard
8. Customer storefront
9. .env.example
10. Setup instructions
11. Local development instructions
12. Supabase configuration instructions
13. Razorpay configuration instructions
14. Deployment instructions
15. Production security checklist

The website should ultimately communicate:

**ANGLELIX**
**by Suraj**

A sophisticated fragrance house with a clean, modern and premium shopping experience.

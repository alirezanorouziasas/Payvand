# Payvand Production Scaffold

This version implements the priority list as a production-ready scaffold:

- Supabase integration
- Real authentication wiring
- Real database API layer
- File upload wiring for receipts and case documents
- Admin permissions via roles
- Audit logs
- Mobile responsiveness
- Push-notification placeholder
- Payment integration placeholders: Stripe Payment Link / Vipps / Bank transfer
- Analytics/dashboard

## 1. Deploy
Upload these files to your GitHub repo root and deploy with Vercel:
- package.json
- index.html
- public/
- src/
- supabase-schema.sql
- .env.example
- README.md

Vercel settings:
- Framework: Vite
- Build command: npm run build
- Output directory: dist

## 2. Supabase setup
1. Create Supabase project.
2. Open SQL Editor.
3. Paste and run `supabase-schema.sql`.
4. Go to Storage and create buckets:
   - receipts
   - case-documents
5. Go to Project Settings → API and copy:
   - Project URL
   - anon public key

## 3. Vercel environment variables
Add:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PAYMENT_LINK
VITE_VIPPS_NUMBER
VITE_BANK_ACCOUNT

Then redeploy.

## 4. Important
The app works in demo mode without Supabase using localStorage. Real multi-user storage requires Supabase env variables and schema.

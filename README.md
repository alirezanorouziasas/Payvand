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


## Final update added by ChatGPT
This package is the new consolidated final version based on the uploaded production scaffold. It includes:
- Production-style folder structure
- Supabase integration
- Real API layer with demo fallback
- Admin dashboard
- Emergency case submission with document upload
- Payment receipt upload
- Donations
- Audit logs
- Analytics and CSV export
- Detailed governance/rules section
- PWA manifest and Payvand logo assets

After uploading to GitHub:
1. Run `supabase-schema.sql` again in Supabase SQL Editor.
2. Confirm Storage buckets exist: `receipts` and `case-documents`.
3. Redeploy in Vercel without build cache.


## Access-control and donation-verification update
This version separates access:
- Member Login / Registration for ordinary members.
- Admin Login for owner/admin only.
- Owner email is set to `alirezanorouziasas@gmail.com`.
- Only the owner can promote another signed-up user to admin from the Admin panel.
- Admin panel is hidden unless the signed-in profile role is `owner` or `admin`.

Donation rule:
- Guest donations are saved as `pending`.
- Pending donations do not increase the Emergency Fund balance.
- Admin must approve a donation before it is counted in the verified Emergency Fund.

Responsiveness:
- Mobile layout works full-screen.
- Desktop/laptop layout expands into a multi-column dashboard.

After uploading:
1. Run `supabase-schema.sql` again.
2. Redeploy in Vercel without build cache.
3. Sign up once with `alirezanorouziasas@gmail.com` so Supabase creates your owner profile.


## Password reset update
This version adds password recovery:
- Member Login has “Forgot password?”
- Admin Login has “Forgot password?”
- Users receive a Supabase reset email.
- Reset links return to `/?mode=update-password`.
- The app then lets the user create a new password.

Supabase setting required:
Authentication → URL Configuration:
- Site URL: your Vercel URL, e.g. `https://payvand.vercel.app`
- Redirect URLs: `https://payvand.vercel.app/*`

If you use another Vercel domain, add that domain instead.


## Signup fix update
This version improves error handling so Supabase errors show readable messages instead of `{}`.
It also creates a pending `members` row when a user signs up from Member Login.

If signup still fails and the user does not appear in Supabase Authentication → Users, check:
- Authentication → Providers → Email is enabled
- Authentication → Providers → Email signups are enabled
- The Supabase schema/profile trigger ran successfully


## Auth/access clean fix
This version fixes:
- No default admin user in the browser.
- Admin and Rules tabs should be hidden until a signed-in owner/admin user exists.
- Member signup only creates the Supabase Auth user first.
- Admin self-registration is blocked.
- Errors should show readable Supabase messages instead of `{}`.
- Owner email is `alirezanorouziasas@gmail.com`.

If signup still does not create a user in Supabase Authentication → Users:
1. Supabase → Authentication → Providers → Email.
2. Enable Email provider.
3. Enable signups.
4. Temporarily disable email confirmation for testing.
5. Verify Vercel env variables are in the exact project you are opening.
6. Run `payvand-auth-diagnostic.sql` after trying signup.


## Groups feature
This version adds a `Groups` section so Payvand can run several rotating circles at the same time.

New flow:
1. Admin creates groups, e.g. Group A, Group B, Family Support Group, Student Group.
2. Approved members can request to join one or more groups.
3. Admin approves or rejects group join requests.
4. Each group can have its own monthly contribution, payout amount, capacity, start month, and period.
5. This avoids waiting for one full round to finish before new members can participate.

Run `payvand-groups-schema.sql` in Supabase SQL Editor after your main schema.

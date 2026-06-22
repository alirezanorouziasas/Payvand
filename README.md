# Payvand MVP — Supabase Connected

This version connects the Payvand MVP to Supabase.

## 1. Create Supabase project
Create a project in Supabase.

## 2. Run database schema
Open Supabase → SQL Editor → New query.
Copy everything from:

```text
supabase/schema.sql
```

Run it.

## 3. Add Vercel Environment Variables
In Vercel → Project → Settings → Environment Variables, add:

```text
VITE_SUPABASE_URL = your Supabase project URL
VITE_SUPABASE_ANON_KEY = your anon public key
```

Add them to Production, Preview, and Development.

## 4. Deploy
Push/upload this project to GitHub and redeploy on Vercel.

## 5. Build settings in Vercel
Framework Preset: Vite  
Build Command: npm run build  
Output Directory: dist  
Install Command: npm install  
Root Directory: ./

## Included features
- English/Persian language switcher
- RTL mode for Persian
- Supabase Auth login/register
- Members loaded from Supabase
- Queue loaded from Supabase
- Donations saved to Supabase
- Donations automatically added to Emergency Fund ledger
- Emergency Fund balance calculated from Supabase
- Responsive layout


## Button functionality update
The following buttons now work:
- Pay Monthly registers a payment in Supabase
- View Queue scrolls to the queue section
- Add Transaction adds a reserve transaction to Emergency Fund
- Share Donation Link copies/shares the donation URL
- Add Member creates a pending member
- Export Report downloads a CSV report
- Open Rules shows the governance rules


## Final emergency-case update
This consolidated version includes all latest changes:
- Supabase-connected bilingual app
- Responsive layout
- Fixed action buttons
- Donate to Emergency Fund
- Submit Emergency Case section
- emergency_cases Supabase table and policies

Important: run the updated `supabase/schema.sql` again in Supabase SQL Editor. It uses `create table if not exists`, so it will not delete your existing data.

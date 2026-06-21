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

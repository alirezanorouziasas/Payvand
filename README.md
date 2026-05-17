# Payvand Governance MVP

This version adds:
- Governance & Terms screen
- Terms & Conditions
- Community Charter / Statutes
- Privacy Policy
- Emergency Fund Policy
- Rotating Fund Rules
- Owner/Admin Policy
- Agreement checkbox in member application
- Audit logs in Admin Panel
- Downloadable governance document
- Supabase schema tables for governance_documents and audit_logs

## Deploy
Upload extracted files to GitHub root:
- package.json
- index.html
- public/
- src/
- supabase-schema.sql
- .env.example
- README.md

Vercel:
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist

## Note
This is demo-mode unless Supabase is connected.

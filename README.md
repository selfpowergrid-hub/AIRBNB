# Port Hill Guest and Accommodation

Website and booking system for Port Hill Guest and Accommodation, 3 minutes from Eldoret International Airport.
Live at https://www.porthillguest.co.ke

Built with Next.js (App Router), Tailwind CSS 4 and Supabase.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |

## Environment variables

See [.env.example](.env.example). Set the same variables in your hosting provider (e.g. Vercel project settings).

## Database

Apply the `supabase_migration_*.sql` files in the Supabase SQL editor. `supabase_migration_lockdown.sql` is required in
production: it stops the public key from reading guest names and phone numbers.
Staff accounts are created in Supabase (Authentication > Users) and sign in at `/manage-bookings`.

## Deployment

Deploy on Vercel (or any Node host). Pushing to `main` triggers a deploy. After the first deploy, submit
`/sitemap.xml` in Google Search Console.

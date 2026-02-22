# Push Database to Supabase

Run these commands in your terminal from the project root (`c:\Users\chris\RowRunner`):

## 1. Log in to Supabase (one-time)

```bash
npx supabase login
```

This opens a browser to authenticate. Complete the flow.

## 2. Link to your project (one-time)

```bash
npx supabase link --project-ref vnakkbgdhuseibiszxex
```

When prompted, enter your **database password** (from Supabase Dashboard → Project Settings → Database).

## 3. Push migrations

```bash
npm run db:push
```

Or:

```bash
npx supabase db push
```

This applies all migrations in `supabase/migrations/` to your hosted Supabase database.

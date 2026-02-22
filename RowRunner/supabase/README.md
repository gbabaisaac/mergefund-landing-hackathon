# RowRunner Supabase Backend

## Setup

### Option A: Supabase CLI (recommended)

From project root, run:

```bash
npx supabase login
npx supabase link --project-ref vnakkbgdhuseibiszxex
npm run db:push
```

See `PUSH_INSTRUCTIONS.md` in the supabase folder for details.

### Option B: Manual (SQL Editor)

1. **Supabase Dashboard** → Your project → SQL Editor
2. Run migrations in order from `migrations/`:
   - `20240222000001_initial_schema.sql`
   - `20240222000002_rls_policies.sql`
   - `20240222000003_seed_data.sql`

## Tables

| Table | Purpose |
|-------|---------|
| `venues` | Stadiums, arenas, concert halls |
| `restaurants` | Food vendors per venue |
| `menu_items` | Menu items per restaurant |
| `user_roles` | Links auth.users to role (customer/runner/admin) |
| `orders` | Customer orders with seat, status, payment |
| `order_items` | Line items per order |
| `runner_sessions` | Runners checked into venues |

## Creating a runner

After a user signs up via Supabase Auth, add them as runner:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<auth-users-uuid>', 'runner');
```

## Creating an admin

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<auth-users-uuid>', 'admin');
```

# Dr Instruments Prototype

## Supabase Setup

Create a `.env` file at the project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app expects a Supabase table named `inventory` with these columns:

- `id` (uuid or serial primary key)
- `sku` (text, unique)
- `name` (text)
- `category` (text)
- `quantity` (numeric)
- `price` (numeric)
- `location` (text)
- `min_stock_threshold` (numeric)

To seed the table with mock data, import and run `seedInventory` from
`src/seedSupabase.ts`.

## Supabase Auth Profiles

Create the `profiles` table in Supabase and link it to `auth.users`:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  role text default 'Technician',
  created_at timestamp with time zone default now()
);
```

To enforce a maximum of 3 users, the UI blocks sign-ups once the `profiles` table has 3 rows.
